import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Mesh gradient for the promo panel. Built from stacked radial-gradients so it
 * scales to any panel size without an image asset — colours sampled from the
 * reference: a hot orange core low-left, blush top-left, pale cream bottom-right.
 */
const MESH =
  "radial-gradient(55% 42% at 36% 82%, rgba(239,118,63,0.95) 0%, rgba(239,118,63,0) 70%)," +
  "radial-gradient(70% 55% at 52% 62%, rgba(240,154,95,0.85) 0%, rgba(240,154,95,0) 72%)," +
  "radial-gradient(75% 60% at 10% 22%, rgba(234,207,197,0.95) 0%, rgba(234,207,197,0) 70%)," +
  "radial-gradient(85% 65% at 96% 6%, rgba(245,231,227,1) 0%, rgba(245,231,227,0) 62%)," +
  "radial-gradient(80% 70% at 100% 100%, rgba(246,232,205,1) 0%, rgba(246,232,205,0) 58%)," +
  "linear-gradient(158deg, #f4dfd8 0%, #f0c9ae 46%, #f5e3c6 100%)";

export function AuthShell({
  kicker,
  headline,
  children,
}: {
  kicker: string;
  headline: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh justify-center bg-auth-card md:items-center md:bg-auth-canvas md:p-8">
      <ThemeToggle
        fallback="light"
        className="absolute right-4 top-4 h-9 w-9 rounded-[10px] text-auth-muted hover:bg-auth-field hover:text-auth-ink"
      />
      <div className="grid w-full bg-auth-card md:max-w-[860px] md:grid-cols-[1fr_1.05fr] md:rounded-2xl md:p-2.5 md:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]">
        {/* Promo panel — hidden on small screens, where the form is the whole job.
            The brand mark lives above the form so it shows at every size. */}
        <aside
          data-keep-light
          className="hidden flex-col justify-end rounded-xl p-7 md:flex md:min-h-[540px]"
          style={{ backgroundImage: MESH }}
        >
          <div>
            <p className="text-[13px] text-auth-ink/70">{kicker}</p>
            <p className="mt-2.5 max-w-[280px] text-[23px] font-semibold leading-[1.22] tracking-[-0.02em] text-auth-ink">
              {headline}
            </p>
          </div>
        </aside>

        {/* Form panel */}
        <section className="flex justify-center px-5 pb-10 pt-12 sm:pt-16 md:items-center md:px-8 md:py-7">
          <div className="w-full max-w-[340px]">{children}</div>
        </section>
      </div>
    </main>
  );
}
