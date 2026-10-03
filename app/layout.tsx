import type { Metadata } from "next";
import { Caveat, IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { OG_IMAGE, SITE } from "@/components/site";
import { THEME_SCRIPT } from "@/components/theme-script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// The hero display face — a monospace set large, per the reference layout.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Handwriting for the About page's pen notes.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  // Pages set a short title ("About"); the template adds the brand.
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    title: SITE.title,
    description: SITE.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [OG_IMAGE.url],
  },
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning covers this element's OWN attributes only — it does
    // not apply to descendants, so real mismatches inside the app still surface.
    // Browser extensions commonly write attributes onto <html> between the server
    // response and hydration, which React would otherwise report as a mismatch.
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${plexMono.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies a saved homepage theme before first paint (D79). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
