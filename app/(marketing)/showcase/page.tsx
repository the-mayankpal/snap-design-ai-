import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { OG_BASE, SITE } from "@/components/site";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShowcaseGallery } from "@/components/showcase-gallery";
import { DESIGNS } from "@/components/showcase-data";

const TITLE = "Mockups & AI design examples";
const DESCRIPTION =
  "Real designs made with snapdesign's AI design generator from a written description — landing pages, social campaigns, slide decks, invoices and graphics.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/showcase" },
  openGraph: { ...OG_BASE, url: "/showcase", title: TITLE, description: DESCRIPTION },
};

/** The gallery as structured data: every design is an image of the page it sits on. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE.url}/showcase#page`,
  url: `${SITE.url}/showcase`,
  name: TITLE,
  description: DESCRIPTION,
  isPartOf: { "@id": `${SITE.url}/#website` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: DESIGNS.map(({ src, alt, width, height }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "ImageObject",
        contentUrl: `${SITE.url}${src}`,
        name: alt,
        caption: alt,
        width,
        height,
      },
    })),
  },
};

export default function ShowcasePage() {
  return (
    <main className="flex-1">
      <JsonLd data={JSON_LD} />
      <Navbar />

      <section className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-32 sm:px-6">
        <h1 className="text-center font-serif text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-none tracking-[-0.03em] text-ink-900">
          AI designs made with snapdesign
        </h1>
        <p className="mx-auto mt-5 max-w-[460px] text-center text-[15px] leading-relaxed text-ink-500">
          Websites, marketing visuals, slides, invoices and graphics — all generated
          from a written description.
        </p>

        <ShowcaseGallery designs={DESIGNS} />
      </section>

      <Footer />
    </main>
  );
}
