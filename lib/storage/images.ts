import "server-only";

import { IMAGE_TYPES, MAX_IMAGE_MB } from "@/components/designs/design-model";
import { HttpError } from "@/lib/api";
import { BUCKET, supabaseAdmin } from "@/lib/supabase/server";

/**
 * The bucket is private, so every image is read through a signed link. An hour
 * covers an editor session. A link is reused for most of its life, so the same
 * image keeps the same URL across page loads and the browser serves it from
 * its cache instead of downloading it again.
 */
const SIGNED_URL_SECONDS = 60 * 60;
const REUSE_MS = 50 * 60 * 1000;
const signedCache = new Map<string, { url: string; until: number }>();

/** Generated images never change once stored. */
const IMMUTABLE = "31536000";

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const bucket = () => supabaseAdmin().storage.from(BUCKET);

/**
 * Attachments go straight from the browser to Storage through signed upload
 * URLs: Vercel caps a function's request body at 4.5 MB, below one 10 MB image.
 * The server only picks the path, so a client cannot write outside its design.
 */
export async function createUploadSlots(
  designId: string,
  files: { type: string; size: number }[],
) {
  for (const file of files) {
    if (!IMAGE_TYPES.includes(file.type)) {
      throw new HttpError(400, "Only PNG, JPG, WebP and GIF images can be attached.");
    }
    if (!(file.size > 0 && file.size <= MAX_IMAGE_MB * 1024 * 1024)) {
      throw new HttpError(400, `Images must be under ${MAX_IMAGE_MB} MB.`);
    }
  }
  return Promise.all(
    files.map(async (file) => {
      const path = `${designId}/uploads/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
      const { data, error } = await bucket().createSignedUploadUrl(path);
      if (error) throw error;
      return { path, url: data.signedUrl };
    }),
  );
}

/** True for a path `createUploadSlots` could have issued for this design. */
export function isUploadPath(designId: string, path: string) {
  return new RegExp(
    `^${designId}/uploads/[0-9a-f-]{36}\\.(png|jpg|webp|gif)$`,
  ).test(path);
}

/** Stores a generated image at `generations/<id>.<ext>` and returns the path. */
export async function uploadGeneration(generationId: string, image: Uint8Array, type: string) {
  const path = `generations/${generationId}.${EXTENSIONS[type]}`;
  const { error } = await bucket().upload(path, image, { contentType: type, cacheControl: IMMUTABLE });
  if (error) throw error;
  return path;
}

/** Signs many paths in one request. Paths that fail to sign are left out. */
export async function signPaths(paths: string[]) {
  const signed = new Map<string, string>();
  const now = Date.now();
  const missing: string[] = [];
  for (const path of new Set(paths)) {
    const cached = signedCache.get(path);
    if (cached && cached.until > now) signed.set(path, cached.url);
    else missing.push(path);
  }
  if (missing.length === 0) return signed;
  const { data, error } = await bucket().createSignedUrls(missing, SIGNED_URL_SECONDS);
  if (error) throw error;
  for (const item of data) {
    if (item.path && item.signedUrl) {
      signed.set(item.path, item.signedUrl);
      signedCache.set(item.path, { url: item.signedUrl, until: now + REUSE_MS });
    }
  }
  return signed;
}

export async function removePaths(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await bucket().remove(paths);
  if (error) throw error;
  for (const path of paths) signedCache.delete(path);
}

/** Reads a stored image back, e.g. as the source for an edit. */
export async function downloadPath(path: string) {
  const { data, error } = await bucket().download(path);
  if (error) throw error;
  return data;
}
