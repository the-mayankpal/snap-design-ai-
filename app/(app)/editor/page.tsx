import { redirect } from "next/navigation";

/** A design is always opened by id; the bare editor URL goes to the list. */
export default function EditorIndexPage() {
  redirect("/designs");
}
