import type { Metadata } from "next";

import { OG_BASE } from "@/components/site";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a free snapdesign account and turn plain-word descriptions into finished websites, social posts, slides and invoices.",
  alternates: { canonical: "/signup" },
  openGraph: { ...OG_BASE, url: "/signup", title: "Create an account", description: "Create a free snapdesign account and turn plain-word descriptions into finished websites, social posts, slides and invoices." },
};

export default async function SignupPage(props: PageProps<"/signup">) {
  const params = await props.searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  return (
    <AuthShell
      kicker="No design skills needed"
      headline="Turn a sentence into a design you would be proud to ship."
    >
      <AuthForm mode="signup" next={next} />
      <AuthFooterLink
        text="Already have an account?"
        linkLabel="Sign in"
        href="/login"
      />
    </AuthShell>
  );
}
