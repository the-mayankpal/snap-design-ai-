import type { Metadata } from "next";

import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Enter your email and we will send you a link to reset your snapdesign password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell kicker="It happens" headline="We'll get you back to your designs in a minute.">
      <ForgotForm />
      <AuthFooterLink text="Remembered it?" linkLabel="Sign in" href="/login" />
    </AuthShell>
  );
}
