"use client";

import { useEffect, useState } from "react";

import { AuthHeading, authMessage, Notice } from "@/components/auth/auth-ui";
import { supabaseBrowser } from "@/lib/supabase/browser";

const COOLDOWN_SECONDS = 60;

/**
 * "Check your inbox", with a resend button that waits a minute between sends
 * — Supabase rate-limits auth emails, and a second click usually means the
 * first one hasn't arrived yet.
 */
export function CheckEmail({ email, kind }: { email: string; kind: "signup" | "recovery" }) {
  const [wait, setWait] = useState(COOLDOWN_SECONDS);
  const [status, setStatus] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const resend = async () => {
    setWait(COOLDOWN_SECONDS);
    const auth = supabaseBrowser().auth;
    const { error } =
      kind === "signup"
        ? await auth.resend({
            type: "signup",
            email,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
          });
    setStatus(error ? { tone: "error", text: authMessage(error) } : { tone: "info", text: "Sent again." });
  };

  return (
    <>
      <AuthHeading
        title="Check your email"
        blurb={
          <>
            We sent a link to <span className="font-medium text-auth-ink">{email}</span>.{" "}
            {kind === "signup"
              ? "Open it to confirm your account and start designing."
              : "Open it to choose a new password."}
          </>
        }
      />
      <div className="mt-6 space-y-3">
        {status ? <Notice tone={status.tone}>{status.text}</Notice> : null}
        <p className="text-[13px] leading-relaxed text-auth-muted">
          Didn&apos;t get it? Check your spam folder, or{" "}
          {wait > 0 ? (
            <span>resend in {wait}s.</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="font-medium text-accent hover:underline"
            >
              send it again
            </button>
          )}
        </p>
      </div>
    </>
  );
}
