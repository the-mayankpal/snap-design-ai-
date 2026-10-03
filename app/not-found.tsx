import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { NotFoundActions } from "@/components/not-found-actions";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Head back to snapdesign and describe something to design.",
};

const SUGGESTIONS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Sign in", href: "/login" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-1 flex-col">
      <Navbar />

      <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
        {/* Two crops of the same artwork — a landscape lockup reads badly in a
            narrow column, so the portrait version takes over below `sm`. */}
        <Image
          src="/errors/404-desktop.png"
          alt=""
          width={1200}
          height={770}
          priority
          className="hidden h-auto w-full max-w-[520px] sm:block"
        />
        <Image
          src="/errors/404-mobile.png"
          alt=""
          width={900}
          height={1338}
          priority
          className="h-auto w-full max-w-[280px] sm:hidden"
        />

        <h1 className="mt-8 font-serif text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-none tracking-[-0.03em] text-ink-900">
          This page went in the bin.
        </h1>

        <p className="mt-5 max-w-[420px] text-[15px] leading-relaxed text-ink-500">
          The page you&rsquo;re looking for doesn&rsquo;t exist, or it has moved.
          Let&rsquo;s get you back to something useful.
        </p>

        <NotFoundActions />

        <p className="mt-12 text-[13px] text-ink-300">You might be looking for:</p>
        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {SUGGESTIONS.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="text-[14px] text-ink-500 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
