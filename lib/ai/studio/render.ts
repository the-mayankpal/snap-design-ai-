import "server-only";

import { toFile } from "openai";

import { models, openai } from "@/lib/ai/openai";
import { call, FAILED, PipelineError } from "@/lib/ai/pipeline";

/**
 * The image call. `source` is a stored image: for an edit, the image being
 * changed; for the next in a series, the style reference. Without one, a
 * fresh generation.
 *
 * WebP at 85% is ~15x smaller than PNG with no visible loss, and medium
 * quality renders ~25% faster than the default with no visible difference
 * (measured 2026-10-01). `OPENAI_IMAGE_QUALITY` overrides it.
 */
const OUTPUT = { format: "webp" as const, type: "image/webp", compression: 85 };
type Quality = "low" | "medium" | "high" | "auto";
export async function render(
  prompt: string,
  size: { width: number; height: number },
  source: Blob | null,
) {
  const { image: model } = models();
  const started = Date.now();
  const quality = (process.env.OPENAI_IMAGE_QUALITY || "medium") as Quality;
  const common = {
    model,
    prompt,
    size: `${size.width}x${size.height}`,
    quality,
    output_format: OUTPUT.format,
    output_compression: OUTPUT.compression,
    n: 1,
  };

  const result = await call("render", async () =>
    source
      ? openai().images.edit({
          ...common,
          image: await toFile(source, `source.${source.type.split("/")[1] || "png"}`, {
            type: source.type || "image/png",
          }),
        })
      : openai().images.generate(common),
  );
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new PipelineError(FAILED.render, "render: no image returned");
  return {
    image: new Uint8Array(Buffer.from(b64, "base64")),
    type: OUTPUT.type,
    model,
    ms: Date.now() - started,
  };
}
