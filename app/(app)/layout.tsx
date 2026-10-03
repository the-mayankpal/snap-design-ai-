import type { ReactNode } from "react";

/** Editor and dashboard: themed through the `ed-*` tokens, dark unless light is chosen (D79). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div data-app className="contents">
      {children}
    </div>
  );
}
