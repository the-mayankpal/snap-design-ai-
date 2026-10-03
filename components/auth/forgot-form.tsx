"use client";

import { useState } from "react";

import { CheckEmail } from "@/components/auth/check-email";
import { AuthHeading, authMessage, Notice, SubmitButton, TextField } from "@/components/auth/auth-ui";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Sends a password reset link. The link lands on /auth/callback, then /reset-password. */
export function ForgotForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo) return <CheckEmail email={sentTo} kind="recovery" />;

  return (
    <>
      <AuthHeading
        title="Reset your password"
        blurb="Enter the email you signed up with and we'll send you a link to choose a new password."
      />
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
          setBusy(true);
          setError(null);
          const { error: failure } = await supabaseBrowser().auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
          });
          setBusy(false);
          // Unknown addresses get the same answer, so the form can't be used to find accounts.
          if (failure) setError(authMessage(failure));
          else setSentTo(email);
        }}
        className="mt-6 space-y-3"
      >
        {error ? <Notice tone="error">{error}</Notice> : null}
        <TextField id="email" label="Your email" type="email" autoComplete="email" placeholder="you@studio.com" />
        <SubmitButton busy={busy}>{busy ? "Sending…" : "Send reset link"}</SubmitButton>
      </form>
    </>
  );
}
