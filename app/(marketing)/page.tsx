import type { Metadata } from "next";

import { PromptProvider } from "@/components/prompt-context";
import { DockedPrompt } from "@/components/docked-prompt";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { DesignRange } from "@/components/design-range";
import { Faq, FAQS } from "@/components/faq";
import { Footer } from "@/components/footer";
import { LEGAL } from "@/components/legal/legal-data";
import { OG_BASE, SITE } from "@/components/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...OG_BASE, url: "/", title: SITE.title, description: SITE.description },
};

/**
 * Structured data: who we are, the site, the app, and the FAQ — the last can show as
 * expandable answers in search results. Built from the same FAQS the page
 * renders, so the two never drift apart.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      // Google wants a square logo of at least 112px; the share image is wide.
      logo: { "@type": "ImageObject", url: `${SITE.url}/apple-icon`, width: 180, height: 180 },
      email: LEGAL.email,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.url}/#app`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

export default function LandingPage() {
  return (
    <PromptProvider>
      <script
        type="application/ld+json"
        // Static, server-built JSON; `<` escaped so it cannot close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
      />
      {/* Takes the dark theme when it is on (D79). */}
      <div data-themed className="flex flex-1 flex-col bg-background">
        <main className="flex-1">
          <Navbar />
          <Hero />
          <HowItWorks />
          <DesignRange />
          <Faq />
          <Footer />
        </main>
        <DockedPrompt />
      </div>
    </PromptProvider>
  );
}
