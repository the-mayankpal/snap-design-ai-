import { renderAppIcon } from "@/components/brand/app-icon";

/** Browser-tab and search-result icon. 96px: a multiple of 48, as Google asks. */
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return renderAppIcon(size.width, { rounded: true });
}
