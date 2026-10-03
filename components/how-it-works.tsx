import { DescribeArt, DesignArt, DownloadArt } from "@/components/how-it-works-art";

/**
 * "How it works" — the three D's, one card each: Describe (dark), Design
 * (light, centred), Download (dark). Each card carries an SVG illustration of
 * its step (how-it-works-art.tsx) in the brand palette, over a grain texture.
 */
export function HowItWorks() {
  return (
    // `scroll-mt` clears the fixed navbar when the nav link jumps here.
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-6 pb-24 pt-8"
    >
      <header className="text-center">
        <h2 className="font-serif text-[clamp(2rem,4.4vw,3.25rem)] font-bold leading-none tracking-[-0.025em] text-ink-900">
          How it works
        </h2>
        <p className="mt-4 text-[17px] text-ink-500 sm:text-[19px]">
          Three steps to your <span className="text-accent">finished design</span>
        </p>
      </header>

      <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-7">
        <DescribeCard />
        <DesignCard />
        <DownloadCard />
      </div>

      <p className="mt-14 text-center text-[16px] text-ink-500 sm:text-[17px]">
        Getting started is simple
      </p>
    </section>
  );
}

/** The step label: a flat 1px-bordered tag in mono — "STEP 01", number in accent. */
function Chip({ n, dark }: { n: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-[6px] border px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] ${
        dark ? "border-white/[0.16] text-white/70" : "border-black/[0.1] text-ink-500 dark:border-white/[0.12]"
      }`}
    >
      Step <span className="text-accent">{n}</span>
    </span>
  );
}

/**
 * Cloud texture: low-frequency fractal noise, its brightness turned into the
 * accent colour's alpha, so it reads as lit haze. Where it shows is decided by
 * a CSS mask on the class passed in.
 */
function Clouds({ className }: { className: string }) {
  return (
    <svg aria-hidden className={`absolute inset-0 h-full w-full ${className}`} preserveAspectRatio="none">
      <filter id="snap-clouds" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={5} seed={7} />
        <feColorMatrix
          values="0 0 0 0 0.98
                  0 0 0 0 0.55
                  0 0 0 0 0.38
                  0 0 0 2.6 -1.05"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#snap-clouds)" />
    </svg>
  );
}

const CARD =
  "relative flex min-h-[440px] flex-col overflow-hidden rounded-[6px] p-7 shadow-[0_2px_4px_rgba(20,15,10,0.06),0_24px_48px_-20px_rgba(20,15,10,0.35)] md:aspect-[424/560] md:min-h-0";

/** 1 — Describe: dark, soft cloud haze, the prompt typing itself. */
function DescribeCard() {
  return (
    <article className={`${CARD} grain bg-ink-night text-white`}>
      <Clouds className="describe-clouds opacity-70" />

      <h3 className="relative text-[clamp(2.2rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em]">
        Describe
      </h3>

      <DescribeArt className="relative my-auto w-full" />

      <div className="relative">
        <Chip dark n="01" />
        <p className="mt-3 text-[15px] leading-snug text-white/85">
          Type what you need in plain words. A landing page for your roofing company, a poster for
          a coffee brand.
        </p>
      </div>
    </article>
  );
}

/** 2 — Design: light, centred, a layout assembling on an artboard. */
function DesignCard() {
  return (
    <article className={`${CARD} items-center bg-surface text-center text-ink-900`}>
      <Chip n="02" />
      <h3 className="mt-3 text-[clamp(2.2rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em]">
        Design
      </h3>

      <DesignArt className="my-auto w-full" />

      <p className="max-w-[300px] text-[15px] leading-snug text-ink-500">
        snapdesign lays it out: type, color, spacing. Ask for changes the way you would ask a
        designer, or pick a variation.
      </p>
    </article>
  );
}

/** 3 — Download: dark, the finished design and the file it becomes. */
function DownloadCard() {
  return (
    <article className={`${CARD} grain bg-ink-night text-white`}>
      <h3 className="relative text-[clamp(2.2rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em]">
        Download
      </h3>

      <DownloadArt className="relative my-auto w-full" />

      <div className="relative">
        <Chip dark n="03" />
        <p className="mt-3 text-[15px] leading-snug text-white/85">
          Take it as a high-resolution image, ready to post, print or hand to a developer. It is
          yours, commercial use included.
        </p>
      </div>
    </article>
  );
}
