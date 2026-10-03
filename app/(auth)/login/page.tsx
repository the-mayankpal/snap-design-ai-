import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your snapdesign account to get back to your designs.",
  // Private or thin — kept out of search results.
  robots: { index: false, follow: false },
};

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const notice =
    params.error === "link"
      ? "That link has expired or was already used. Sign in, or ask for a new link."
      : undefined;
  return (
    <AuthShell
      kicker="Good to see you again"
      headline="Pick up right where you left off and keep designing."
    >
      <AuthForm mode="login" next={next} notice={notice} />
      <AuthFooterLink
        text="Don't have an account?"
        linkLabel="Sign up"
        href="/signup"
      />
    </AuthShell>
  );
}
