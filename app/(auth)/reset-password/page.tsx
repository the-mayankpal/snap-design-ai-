import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";
import { readUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Choose a new password for your snapdesign account.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const user = await readUser();
  return (
    <AuthShell kicker="Almost there" headline="Pick a new password and carry on designing.">
      <ResetForm signedIn={Boolean(user)} />
    </AuthShell>
  );
}
