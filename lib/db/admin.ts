import "server-only";

import { emailKey, FREE_IMAGES, isExempt } from "@/lib/quota";
import { signPaths } from "@/lib/storage/images";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * The owner's view of every account (D84): one record per user with their
 * designs, images, chat and free-tier use, read with the service role. Only
 * the admin page calls this, after checking ADMIN_EMAILS.
 */

/** Newest images shown on each user's card. */
const RECENT_IMAGES = 8;

export function isAdmin(email: string) {
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase());
  return Boolean(email) && list.includes(email.toLowerCase());
}

type GenerationRow = {
  id: string;
  status: string;
  error: string | null;
  raw_prompt: string;
  image_path: string | null;
  created_at: string;
  note: string | null;
};

type DesignRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pinned_at: string | null;
  messages: { role: string; text: string; created_at: string }[];
  generations: GenerationRow[];
};

export type UserOverview = {
  id: string;
  email: string;
  verified: boolean;
  provider: string;
  signedUpAt: string;
  lastSignInAt: string | null;
  lastActiveAt: string | null;
  free: { used: number; limit: number | null };
  totals: { designs: number; images: number; failed: number; prompts: number };
  designs: {
    id: string;
    title: string;
    updatedAt: string;
    pinned: boolean;
    images: number;
    prompts: string[];
  }[];
  recent: { id: string; url: string; note: string | null; createdAt: string }[];
};

async function listAllUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabaseAdmin().auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

const newest = <T extends { created_at: string }>(rows: T[]) =>
  [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));

export async function loadUserOverviews(): Promise<UserOverview[]> {
  const db = supabaseAdmin();
  const users = await listAllUsers();

  const { data, error } = await db
    .from("designs")
    .select(
      "id, user_id, title, created_at, updated_at, pinned_at, messages(role, text, created_at), generations!generations_design_id_fkey(id, status, error, raw_prompt, image_path, created_at, note)",
    )
    .not("user_id", "is", null);
  if (error) throw error;
  const designs = (data ?? []) as unknown as DesignRow[];

  const keys = new Map(users.map((user) => [user.id, user.email ? emailKey(user.email) : null]));
  const { data: usage, error: usageError } = await db
    .from("free_usage")
    .select("key, images")
    .in("key", [...keys.values()].filter((key): key is string => Boolean(key)));
  if (usageError) throw usageError;
  const used = new Map((usage ?? []).map((row) => [row.key as string, row.images as number]));

  const overviews = users.map((user) => {
    const own = designs.filter((design) => design.user_id === user.id);
    const generations = own.flatMap((design) => design.generations);
    const images = newest(generations.filter((row) => row.status === "succeeded" && row.image_path));
    const prompts = own.flatMap((design) => design.messages.filter((m) => m.role === "user"));
    const key = keys.get(user.id);
    const activity = [...own.map((d) => d.updated_at), ...generations.map((g) => g.created_at)].sort();
    return {
      user,
      images,
      record: {
        id: user.id,
        email: user.email ?? "",
        verified: Boolean(user.email_confirmed_at),
        provider: String(user.app_metadata?.provider ?? "email"),
        signedUpAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
        lastActiveAt: activity.at(-1) ?? null,
        free: {
          used: key ? (used.get(key) ?? 0) : 0,
          limit: user.email && isExempt(user.email) ? null : FREE_IMAGES,
        },
        totals: {
          designs: own.length,
          images: images.length,
          failed: generations.filter((row) => row.status === "failed").length,
          prompts: prompts.length,
        },
        designs: [...own]
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
          .map((design) => ({
            id: design.id,
            title: design.title,
            updatedAt: design.updated_at,
            pinned: Boolean(design.pinned_at),
            images: design.generations.filter((row) => row.status === "succeeded").length,
            prompts: newest(design.messages.filter((m) => m.role === "user")).map((m) => m.text),
          })),
        recent: [] as UserOverview["recent"],
      },
    };
  });

  const toSign = overviews.flatMap(({ images }) => images.slice(0, RECENT_IMAGES));
  const urls = await signPaths(toSign.map((row) => row.image_path as string));
  for (const { images, record } of overviews) {
    record.recent = images.slice(0, RECENT_IMAGES).map((row) => ({
      id: row.id,
      url: urls.get(row.image_path as string) ?? "",
      note: row.note,
      createdAt: row.created_at,
    }));
  }

  return overviews
    .map(({ record }) => record)
    .sort((a, b) => (b.lastActiveAt ?? b.signedUpAt).localeCompare(a.lastActiveAt ?? a.signedUpAt));
}
