"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function NotFoundActions() {
  const router = useRouter();

  return (
    <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
      <Link
        href="/"
        className="w-full rounded-full bg-ink-700 px-6 py-3 text-center text-[14px] font-medium text-surface transition-opacity hover:opacity-90 sm:w-auto"
      >
        Go to homepage
      </Link>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="w-full rounded-full bg-surface-muted px-6 py-3 text-center text-[14px] font-medium text-ink-900 transition-colors hover:bg-black/[0.06] sm:w-auto"
      >
        Try again
      </button>
    </div>
  );
}
