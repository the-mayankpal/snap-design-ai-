import { renderAppIcon } from "@/components/brand/app-icon";

/** iPhone / iPad home-screen icon. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderAppIcon(size.width, { rounded: false });
}
