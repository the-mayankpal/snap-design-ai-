import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { PEN_COLOR, PEN_STROKE, PEN_VIEWBOX } from "@/components/brand/pen-underline";
import { HEX } from "@/components/brand/palette";

/** The social preview card (link shares on X, LinkedIn, iMessage, Slack…). */
export const alt = "snapdesign — AI design generator: describe it, get a design";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The generator's default font has no heavy weight; the wordmark needs Inter
// ExtraBold to match the site. TTFs live in assets/fonts (OFL-licensed).
const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Inter-800.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Inter-600.ttf")),
]);

export default async function OpengraphImage() {
  const [extraBold, semiBold] = await fonts;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          fontFamily: "Inter",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          backgroundColor: HEX.paper,
          // Notebook ruling, as on the About page.
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 47px, ${HEX.paperRule} 47px, ${HEX.paperRule} 48px)`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -6, color: HEX.foreground, lineHeight: 1 }}>
            snapdesign
          </div>
          {/* The brand's pen stroke. */}
          <svg width="690" height="36" viewBox={PEN_VIEWBOX} style={{ marginTop: 6 }}>
            <path d={PEN_STROKE} fill={PEN_COLOR} />
          </svg>
        </div>
        <div style={{ marginTop: 44, fontSize: 52, fontWeight: 600, color: HEX.foreground, letterSpacing: -1.5 }}>
          Describe it. We&rsquo;ll design it.
        </div>
        <div style={{ marginTop: 18, fontSize: 30, color: HEX.inkMuted }}>
          Websites · Marketing · Slides · Invoices · Graphics
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: extraBold, weight: 800, style: "normal" },
        { name: "Inter", data: semiBold, weight: 600, style: "normal" },
      ],
    },
  );
}
