import type { Metadata } from "next";
import { DesignsGallery } from "@/components/designs/designs-gallery";

export const metadata: Metadata = {
  title: "Your designs",
  // Private or thin — kept out of search results.
  robots: { index: false, follow: false },
};

export default function DesignsPage() {
  return <DesignsGallery />;
}
