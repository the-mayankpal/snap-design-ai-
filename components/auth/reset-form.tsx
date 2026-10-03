"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthHeading, authMessage, MIN_PASSWORD, Notice, SubmitButton } from "@/components/auth/auth-ui";
import { PasswordField } from "@/components/auth/password-field";
import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * Choosing a new password. The reset link has already signed them in (via
 * /auth/callback), so this only updates the password of the current session.
 */
export function ResetForm({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <>
        <AuthHeading
          title="This link has expired"
          blurb="Reset links work once and only for a short time. Ask for a new one and use it straight away."
        />
        <Link
          href="/forgot-password"
          className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-auth-ink text-[14px] font-medium text-auth-card transition-opacity hover:opacity-90"
        >
          Send a new link
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthHeading title="Choose a new password" blurb={`At least ${MIN_PASSWORD} characters.`} />
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const password = String(data.get("password") ?? "");
          if (password !== String(data.get("confirm") ?? "")) {
            setError("The two passwords don't match.");
            return;
          }
          setBusy(true);
          setError(null);
          const { error: failure } = await supabaseBrowser().auth.updateUser({ password });
          if (failure) {
            setBusy(false);
            setError(authMessage(failure));
            return;
          }
          router.replace("/designs");
          router.refresh();
        }}
        className="mt-6 space-y-3"
      >
        {error ? <Notice tone="error">{error}</Notice> : null}
        <PasswordField
          id="password"
          label="New password"
          placeholder="••••••••••••"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
        />
        <PasswordField
          id="confirm"
          label="Repeat new password"
          placeholder="••••••••••••"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
        />
        <SubmitButton busy={busy}>{busy ? "Saving…" : "Save password"}</SubmitButton>
      </form>
    </>
  );
}
