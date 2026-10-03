import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { OG_BASE, SITE } from "@/components/site";
import { altOf } from "@/components/showcase-data";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  BrowserIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  PresentationIcon,
  ReceiptIcon,
} from "@phosphor-icons/react/ssr";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { DescribeIcon, DesignIcon, DownloadIcon } from "@/components/icons/flow-icons";
import {
  Polaroid,
  ScribbleBox,
  SketchArrow,
  Sticker,
  Tag,
  Tape,
} from "@/components/about/scrapbook";
import { COLOR } from "@/components/brand/palette";

const TITLE = "About snapdesign, the AI design generator";
const DESCRIPTION =
  "snapdesign is an AI design generator that turns a sentence into a finished design — websites, marketing visuals, slides, invoices and graphics. Meet the idea behind it.";

export const metadata: Metadata = {
  // Already names the brand, so the template's "· snapdesign" is skipped.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { ...OG_BASE, url: "/about", title: TITLE, description: DESCRIPTION },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE.url}/about#page`,
  url: `${SITE.url}/about`,
  name: TITLE,
  description: DESCRIPTION,
  isPartOf: { "@id": `${SITE.url}/#website` },
  about: { "@id": `${SITE.url}/#organization` },
};

/** Sticker colours — bright, flat, one per thing we design. */
const MAKES = [
  { label: "Websites", bg: COLOR.sun, fg: COLOR.inkSketch, Icon: BrowserIcon },
  { label: "Marketing", bg: COLOR.leaf, fg: "#fff", Icon: MegaphoneIcon },
  { label: "Slides", bg: COLOR.pink, fg: "#fff", Icon: PresentationIcon },
  { label: "Invoices", bg: COLOR.cobalt, fg: "#fff", Icon: ReceiptIcon },
  { label: "Graphics", bg: COLOR.accent, fg: "#fff", Icon: PaintBrushIcon },
];

const BELIEFS = [
  {
    tab: "Belief 01",
    tabBg: COLOR.cobalt,
    panel: "bg-ink-900 text-white",
    meta: "Since day one",
    title: "Plain words are enough.",
    body: "No design software, no brief template, no jargon. Say what you need the way you would say it to a friend.",
    img: "/showcase/website-lumen-ai-model.webp",
    tape: COLOR.butter,
  },
  {
    tab: "Belief 02",
    tabBg: COLOR.inkSketch,
    panel: "bg-sun text-ink-900",
    meta: "Every single design",
    title: "Real design, not AI slop.",
    body: "Considered layouts, proper type and spacing that breathes. Work you would be happy to put your name on.",
    img: "/showcase/website-vestra-streetwear.webp",
    tape: COLOR.sky,
  },
  {
    tab: "Belief 03",
    tabBg: COLOR.accent,
    panel: "bg-paper-warm text-ink-900 ring-1 ring-inset ring-ink-900/10",
    meta: "No fine print",
    title: "It's yours. All of it.",
    body: "Everything you make is yours to use commercially. No attribution, no licensing to chase.",
    img: "/showcase/graphic-sunsip-can-packaging.webp",
    tape: COLOR.mint,
  },
];

export default function AboutPage() {
  return (
    <main data-themed className="flex-1 bg-background">
      <JsonLd data={JSON_LD} />
      <Navbar />

      <div className="lined-paper">
        {/* ——— Hero: the wordmark, pinned and annotated ——— */}
        <section className="relative mx-auto max-w-[1120px] overflow-x-clip px-6 pb-14 pt-28 text-center sm:pb-16 sm:pt-36">
          <p className="font-hand text-[20px] text-ink-500">hello, we&rsquo;re</p>
          <svg aria-hidden viewBox="0 0 60 8" className="mx-auto mt-0.5 h-2 w-14">
            <path d="M2 5 C 14 1, 26 7, 38 3 S 54 4, 58 2" stroke={COLOR.inkSketch} strokeWidth={1.2} fill="none" strokeLinecap="round" />
          </svg>

          <div className="relative mx-auto mt-3 w-fit">
            {/* Tags pinned around the box, with sketched arrows — desktop. */}
            <Tag tone={COLOR.mint} className="absolute -left-28 -top-7 hidden -rotate-6 md:inline-block">
              Describe it
            </Tag>
            <Tag tone={COLOR.butter} className="absolute -right-32 -top-6 hidden rotate-3 md:inline-block">
              Sweat the details
            </Tag>
            <Tag tone={COLOR.sun} hand className="absolute -bottom-10 -left-36 hidden -rotate-3 md:inline-block">
              a design studio in a sentence
            </Tag>
            <Tag tone={COLOR.mint} hand className="absolute -bottom-10 -right-36 hidden rotate-2 md:inline-block">
              made for small businesses
            </Tag>
            <SketchArrow
              className="absolute -bottom-7 -left-12 hidden h-8 w-14 md:block"
              d="M4 40 C 20 34, 34 22, 50 10"
              head="M40 9 L 51 9 L 49 20"
            />
            <SketchArrow
              className="absolute -bottom-7 -right-12 hidden h-8 w-14 -scale-x-100 md:block"
              d="M4 40 C 20 34, 34 22, 50 10"
              head="M40 9 L 51 9 L 49 20"
            />

            <ScribbleBox className="absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)] sm:-inset-x-5 sm:-inset-y-3 sm:h-[calc(100%+24px)] sm:w-[calc(100%+40px)]" />
            <p className="relative px-4 font-mono text-[clamp(2.6rem,9vw,6.25rem)] font-bold leading-none tracking-[-0.05em] text-ink-900">
              snapdesign
            </p>
          </div>

          {/* Phones: the same tags, in a row. */}
          <div className="mx-auto mt-7 flex max-w-[300px] flex-wrap justify-center gap-x-2 gap-y-2.5 md:hidden">
            <Tag tone={COLOR.mint} className="inline-block -rotate-2">Describe it</Tag>
            <Tag tone={COLOR.butter} className="inline-block rotate-2">Sweat the details</Tag>
            <Tag tone={COLOR.sun} hand className="inline-block -rotate-1">made for small businesses</Tag>
          </div>

          <p className="mt-9 flex items-center justify-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-500 sm:text-[11px] sm:tracking-[0.12em] md:mt-14">
            <span className="h-2 w-2 shrink-0 rounded-full bg-cobalt" />
            <span className="sm:hidden">Now designing everything</span>
            <span className="hidden sm:inline">Now designing websites, posts, decks &amp; invoices</span>
          </p>

          <h1 className="mx-auto mt-5 max-w-[760px] text-balance text-[clamp(1.75rem,4.2vw,3rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink-900">
            We turn a sentence <DescribeIcon size={34} className="-mt-1 hidden align-middle sm:inline-block" /> into
            design you&rsquo;d put your name on <DesignIcon size={34} className="-mt-1 hidden align-middle sm:inline-block" />
          </h1>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-3 rounded-[8px] bg-ink-900 py-1.5 pl-1.5 pr-4 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-surface transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-accent">
              <ArrowUpRightIcon size={14} weight="bold" aria-hidden />
            </span>
            Start designing
          </Link>

          {/* Round stickers of real work, stuck either side — desktop. */}
          {[
            { src: "/showcase/marketing-rosehaus-roselle-latte.webp", pos: "left-[6%] top-[58%] -rotate-6" },
            { src: "/showcase/graphic-evolve-sticker-sheet.webp", pos: "right-[6%] top-[56%] rotate-6" },
          ].map(({ src, pos }) => (
            <span
              key={src}
              aria-hidden
              className={`absolute hidden h-16 w-16 overflow-hidden rounded-full border-[3px] border-accent bg-white shadow-[0_6px_14px_-6px_rgba(20,15,10,0.4)] lg:block ${pos}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </span>
          ))}
        </section>

        {/* A loose pen line across the page, and a note on it. */}
        <div className="relative">
          <svg aria-hidden viewBox="0 0 1200 60" preserveAspectRatio="none" className="h-10 w-full">
            <path d="M0 50 C 300 8, 900 8, 1200 50" stroke={COLOR.inkSketch} strokeOpacity={0.35} strokeWidth={1} fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="absolute left-[8%] top-9 -rotate-3 font-hand text-[19px] text-ink-500">about us!</p>
        </div>

        {/* ——— What's up: the handwritten note, taped photos, stickers ——— */}
        <section className="relative mx-auto max-w-[1120px] px-6 pb-20 pt-12 text-center sm:pb-24 sm:pt-16">
          <span className="inline-block rounded-[6px] border border-ink-900 bg-surface px-3 py-1 text-[18px] text-ink-900">
            what&rsquo;s up
          </span>

          <p className="mx-auto mt-7 max-w-[600px] font-hand text-[clamp(1.35rem,2.6vw,1.8rem)] leading-[1.4] text-ink-900 sm:mt-8">
            snapdesign is an AI design generator, made by a small team who got a little too excited
            about making design feel simple. You describe it in plain words <DownloadIcon size={22} className="inline-block align-middle" /> and
            we handle the layout, the type, the colour &mdash; the small details and the edge cases
            everyone forgets &mdash; so your work looks like a real brand made it.
          </p>

          {/* Polaroids either side on desktop; a row beneath on phones. */}
          <Polaroid
            src="/showcase/slides-ember-bean-brand-guideline.webp"
            alt={altOf("/showcase/slides-ember-bean-brand-guideline.webp")}
            caption="made from one sentence"
            className="absolute left-2 top-24 hidden w-44 -rotate-6 xl:block"
          />
          <Polaroid
            src="/showcase/marketing-marmita-fit-meals.webp"
            alt={altOf("/showcase/marketing-marmita-fit-meals.webp")}
            caption="v2, a bit bolder"
            aspect="1 / 1"
            tapes={[COLOR.butter, COLOR.mint]}
            className="absolute right-2 top-10 hidden w-48 rotate-[5deg] xl:block"
          />
          <div className="mt-10 flex justify-center gap-4 sm:gap-6 xl:hidden">
            <Polaroid
              src="/showcase/slides-ember-bean-brand-guideline.webp"
              alt={altOf("/showcase/slides-ember-bean-brand-guideline.webp")}
              caption="made from one sentence"
              className="relative w-36 -rotate-3"
            />
            <Polaroid
              src="/showcase/marketing-marmita-fit-meals.webp"
              alt={altOf("/showcase/marketing-marmita-fit-meals.webp")}
              caption="v2, a bit bolder"
              aspect="1 / 1"
              tapes={[COLOR.butter, COLOR.mint]}
              className="relative mt-6 w-36 rotate-3"
            />
          </div>

          {/* What we design — a sticker, then its icon on a stamp. */}
          <ul className="mx-auto mt-10 flex max-w-[620px] flex-wrap justify-center gap-2 sm:mt-12 sm:gap-2.5">
            {MAKES.map(({ label, bg, fg, Icon }, index) => (
              <li key={label} className={`flex gap-1.5 sm:gap-2.5 ${index % 2 ? "rotate-1" : "-rotate-1"}`}>
                <Sticker bg={bg} fg={fg}>{label}</Sticker>
                <Sticker bg={bg} fg={fg} className="!px-2.5">
                  <Icon size={18} weight="fill" aria-hidden />
                </Sticker>
              </li>
            ))}
          </ul>
        </section>

        {/* ——— What we believe: stacked, tabbed panels ——— */}
        {/* Printed cards on the notebook: they keep their colours in the dark theme. */}
        <section data-keep-light className="mx-auto max-w-[1000px] px-4 pb-20 sm:px-6 sm:pb-24">
          {BELIEFS.map(({ tab, tabBg, panel, meta, title, body, img, tape }, index) => (
            <article key={tab} className={`relative ${index ? "-mt-3" : ""}`} style={{ zIndex: index + 1 }}>
              <span
                // Tabs step right on wider screens, like folder tabs.
                className="relative ml-[var(--tab-x)] inline-flex items-center gap-2 py-2 pl-4 pr-8 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white max-sm:ml-0"
                style={{
                  backgroundColor: tabBg,
                  ["--tab-x" as string]: `${index * 150}px`,
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)",
                }}
              >
                ✦ {tab}
              </span>
              <div className={`grid gap-5 p-6 sm:grid-cols-[1fr_280px] sm:gap-6 sm:p-9 ${panel}`}>
                <div className="flex flex-col">
                  <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {meta}
                  </p>
                  <h2 className="mt-4 text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                    {title}
                  </h2>
                  <p className="mt-3 max-w-[420px] text-[14.5px] leading-relaxed opacity-80 sm:text-[15px]">{body}</p>
                </div>
                <div className="relative mx-auto mt-1 w-[82%] sm:mx-0 sm:mt-0 sm:w-auto">
                  <Tape tone={tape} className="-top-2 left-1/2 z-10 -translate-x-1/2 -rotate-3" />
                  <div className="relative aspect-[16/10] overflow-hidden border-4 border-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]">
                    <Image src={img} alt={altOf(img)} fill sizes="280px" className="object-cover object-top" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* ——— The nudge ——— */}
        <section className="relative mx-auto max-w-[1120px] px-6 pb-20 text-center sm:pb-28">
          <p className="font-hand text-[clamp(1.8rem,3.4vw,2.4rem)] text-ink-900">go on &mdash; describe something</p>
          <SketchArrow
            className="mx-auto mt-1 h-10 w-16"
            d="M40 4 C 34 16, 36 28, 40 42"
            head="M33 34 L 40 43 L 47 34"
          />
          <Link
            href="/signup"
            className="mt-2 inline-flex items-center gap-3 rounded-[8px] bg-ink-900 py-1.5 pl-1.5 pr-4 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-surface transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-accent">
              <ArrowUpRightIcon size={14} weight="bold" aria-hidden />
            </span>
            Start designing
          </Link>
        </section>
      </div>

      <Footer />
    </main>
  );
}
