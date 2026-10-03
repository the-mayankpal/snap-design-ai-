import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Wordmark } from "@/components/brand/wordmark";
import { LoadedImg } from "@/components/loaded-img";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAdmin, loadUserOverviews, type UserOverview } from "@/lib/db/admin";
import { readUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Users",
  robots: { index: false, follow: false },
};

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "never";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-ed-field px-3 py-2 ring-1 ring-ed-hairline">
      <p className="text-[11px] text-ed-muted">{label}</p>
      <p className="text-[15px] font-semibold text-ed-text tabular-nums">{value}</p>
    </div>
  );
}

function UserCard({ user }: { user: UserOverview }) {
  const { free, totals } = user;
  const left = free.limit === null ? null : Math.max(free.limit - free.used, 0);
  return (
    <article className="rounded-2xl bg-ed-panel p-5 ring-1 ring-ed-border">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[16px] font-semibold text-ed-text">{user.email || "(no email)"}</h2>
          <p className="mt-0.5 text-[12px] text-ed-muted">
            {user.verified ? "Verified" : "Not verified"} · {user.provider} · joined {when(user.signedUpAt)}
          </p>
          <p className="text-[12px] text-ed-dim">
            Last sign-in {when(user.lastSignInAt)} · last active {when(user.lastActiveAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
            left === 0 ? "bg-red-500/15 text-red-500" : "bg-ed-raised text-ed-text"
          }`}
        >
          {left === null ? "No limit" : `${free.used} of ${free.limit} free used`}
        </span>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Designs" value={totals.designs} />
        <Stat label="Images" value={totals.images} />
        <Stat label="Failed" value={totals.failed} />
        <Stat label="Prompts" value={totals.prompts} />
      </div>

      {user.recent.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {user.recent.map((image) => (
            <figure key={image.id} className="w-28 shrink-0">
              <div className="aspect-square overflow-hidden rounded-lg bg-ed-field ring-1 ring-ed-hairline">
                {image.url && <LoadedImg src={image.url} alt="" className="h-full w-full object-cover" />}
              </div>
              {image.note && <figcaption className="mt-1 truncate text-[11px] text-ed-muted">{image.note}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      {user.designs.length > 0 && (
        <details className="mt-4 group">
          <summary className="cursor-pointer select-none text-[13px] font-medium text-ed-text">
            Designs and prompts
          </summary>
          <ul className="mt-3 space-y-3">
            {user.designs.map((design) => (
              <li key={design.id} className="rounded-lg bg-ed-field p-3 ring-1 ring-ed-hairline">
                <p className="text-[13px] font-medium text-ed-text">
                  {design.title}
                  {design.pinned && <span className="ml-1.5 text-[11px] font-semibold text-ed-blue">Pinned</span>}
                  <span className="font-normal text-ed-muted">
                    {" "}
                    · {design.images} images · edited {when(design.updatedAt)}
                  </span>
                </p>
                {design.prompts.length > 0 ? (
                  <ol className="mt-2 space-y-1">
                    {design.prompts.map((prompt, index) => (
                      <li key={index} className="text-[12px] leading-snug text-ed-muted">
                        “{prompt}”
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-1 text-[12px] text-ed-dim">No prompts yet</p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

/** Owner only (D84): every account on one page, one card each. Anyone else gets a 404. */
export default async function AdminPage() {
  const me = await readUser();
  if (!me || !isAdmin(me.email)) notFound();

  const users = await loadUserOverviews();
  const images = users.reduce((sum, user) => sum + user.totals.images, 0);

  return (
    <div className="min-h-screen bg-ed-canvas">
      <header className="sticky top-0 z-10 border-b border-ed-border bg-ed-panel/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Wordmark href="/" label="snapdesign — home" className="-mt-1 text-[20px] text-ed-text" />
          <div className="flex items-center gap-2">
            <Link href="/designs" className="rounded-full px-3 py-1.5 text-[13px] text-ed-muted hover:text-ed-text">
              My designs
            </Link>
            <ThemeToggle
              fallback="dark"
              className="h-9 w-9 rounded-lg text-ed-muted hover:bg-ed-field hover:text-ed-text"
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-[22px] font-semibold text-ed-text">Users</h1>
        <p className="mt-1 text-[13px] text-ed-muted">
          {users.length} {users.length === 1 ? "account" : "accounts"} · {images} images made · newest activity first
        </p>
        <div className="mt-6 space-y-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </main>
    </div>
  );
}
