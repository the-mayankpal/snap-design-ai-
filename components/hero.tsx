import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";

import { DescribeIcon, DesignIcon, DownloadIcon } from "@/components/icons/flow-icons";

import { HeroMosaic } from "@/components/hero-mosaic";
import { PromptBox } from "@/components/prompt-box";
import { HERO_PROMPT_ANCHOR_ID } from "@/components/prompt-context";

export function Hero() {
  return (
    <section className="w-full pb-16 pt-28">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 text-center">
        {/* The whole flow in one line, as a quiet eyebrow over the heading. */}
        <p className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 font-mono text-[12.5px] font-medium text-ink-900 shadow-[0_1px_2px_rgba(20,15,10,0.04)] sm:gap-3 sm:px-5 sm:py-2.5 sm:text-[15px]">
          <span className="inline-flex items-center gap-1.5 sm:gap-2">
            <DescribeIcon size={20} />
            Describe
          </span>
          <ArrowRightIcon size={13} className="text-ink-300" aria-hidden />
          <span className="inline-flex items-center gap-1.5 sm:gap-2">
            <DesignIcon size={20} />
            Design
          </span>
          <ArrowRightIcon size={13} className="text-ink-300" aria-hidden />
          <span className="inline-flex items-center gap-1.5 sm:gap-2">
            <DownloadIcon size={20} />
            Download
          </span>
        </p>

        {/* Two-part lockup (brand §6.3), set in the mono display face: the
            first word carries the weight, the rest settles back. */}
        <h1 className="mt-7 max-w-[900px] text-balance font-mono text-[clamp(1.85rem,4.3vw,3.25rem)] leading-[1.15] tracking-[-0.03em] text-ink-900">
          {/* "Describe" sits in a design-tool selection — the brand accent,
              with handles at the corners and mid-edges. Sized in `em` so it
              scales with the heading. */}
          <span className="relative mx-[0.12em] inline-block font-bold">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-[0.14em] -bottom-[0.02em] -top-[0.06em] border-[1.5px] border-accent"
            >
              {[
                "left-0 top-0",
                "left-1/2 top-0",
                "left-full top-0",
                "left-0 top-full",
                "left-1/2 top-full",
                "left-full top-full",
              ].map((pos) => (
                <span
                  key={pos}
                  className={`absolute ${pos} h-[0.16em] min-h-[6px] w-[0.16em] min-w-[6px] -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-accent bg-surface`}
                />
              ))}
            </span>
            Describe
          </span>{" "}
          <span className="font-medium">it. We&rsquo;ll design it.</span>
        </h1>
        <p className="mt-5 max-w-[540px] text-balance text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">
          Websites, social posts, slides and graphics, designed from a single
          sentence.
        </p>

        <div id={HERO_PROMPT_ANCHOR_ID} className="mt-8 w-full max-w-[685px] text-left">
          <PromptBox />
        </div>
      </div>

      {/* Real work straight away — a staggered, full-bleed mosaic. */}
      <div className="mt-6 sm:mt-10">
        <HeroMosaic />
      </div>

      {/* The mosaic shows the work; this is the way into all of it. */}
      <div className="mt-6 flex justify-center px-6 sm:mt-8">
        <Link
          href="/showcase"
          className="group inline-flex h-11 items-center gap-2 rounded-[12px] bg-ink-700 px-5 text-[14px] font-medium text-surface shadow-[0_1px_2px_rgba(20,15,10,0.12),0_8px_20px_-8px_rgba(20,15,10,0.45)] transition-[opacity,transform] hover:opacity-90 active:translate-y-px"
        >
          See all designs
          <ArrowRightIcon
            size={15}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
