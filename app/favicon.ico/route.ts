import { renderAppIcon } from "@/components/brand/app-icon";

/**
 * Some crawlers and older browsers ask for /favicon.ico before reading the
 * page's icon link. Answer with the same icon as /icon (a PNG, which every
 * browser accepts under this name) instead of a 404.
 */
export const dynamic = "force-static";

export function GET() {
  return renderAppIcon(96, { rounded: true });
}
