import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { PEN_COLOR, PEN_STROKE, PEN_VIEWBOX } from "@/components/brand/pen-underline";
import { HEX } from "@/components/brand/palette";

// Same Inter ExtraBold as the wordmark and share image (assets/fonts, OFL).
const extraBold = readFile(join(process.cwd(), "assets/fonts/Inter-800.ttf"));

/**
 * The app icon: the wordmark's "s" with the orange pen stroke under it, on
 * ink. `rounded` gives the browser-tab icon rounded-square corners; the
 * Apple home-screen icon stays square because iOS rounds it itself.
 */
export async function renderAppIcon(px: number, { rounded }: { rounded: boolean }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: HEX.foreground,
          borderRadius: rounded ? px * 0.22 : 0,
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            fontSize: px * 0.8,
            fontWeight: 800,
            color: HEX.paper,
            lineHeight: 1,
            marginTop: -px * 0.06,
          }}
        >
          s
        </div>
        {/* Stretched taller than the logo's stroke so it still reads at 16px. */}
        <svg
          width={px * 0.64}
          height={px * 0.15}
          viewBox={PEN_VIEWBOX}
          preserveAspectRatio="none"
          style={{ marginTop: -px * 0.1 }}
        >
          <path d={PEN_STROKE} fill={PEN_COLOR} />
        </svg>
      </div>
    ),
    {
      width: px,
      height: px,
      fonts: [{ name: "Inter", data: await extraBold, weight: 800, style: "normal" }],
    },
  );
}
