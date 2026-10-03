import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/editor-shell";

export const metadata: Metadata = {
  title: "Editor",
  // Private or thin — kept out of search results.
  robots: { index: false, follow: false },
};

export default async function EditorPage(props: PageProps<"/editor/[id]">) {
  const { id } = await props.params;
  // Keyed so switching designs remounts the editor with fresh state.
  return <EditorShell key={id} designId={id} />;
}
