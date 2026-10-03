import type { ReactNode } from "react";

/** Sign-in pages: themed through the `auth-*` tokens, light unless dark is chosen (D79). */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div data-auth className="contents">
      {children}
    </div>
  );
}
