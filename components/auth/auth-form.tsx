"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CheckEmail } from "@/components/auth/check-email";
import { PasswordField } from "@/components/auth/password-field";
import {
  AuthHeading,
  authMessage,
  MIN_PASSWORD,
  Notice,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-ui";
import { hasPendingPrompt, openPendingPrompt } from "@/components/prompt-handoff";
import { safeNext, supabaseBrowser } from "@/lib/supabase/browser";

type Mode = "signup" | "login";

const COPY = {
  signup: {
    title: "Create an account",
    blurb: "Describe what you need, refine it by chatting, and download it in high resolution.",
    passwordLabel: "Create password",
    submit: "Create account",
    busy: "Creating your account…",
    autoComplete: "new-password",
  },
  login: {
    title: "Welcome back",
    blurb: "Your designs are waiting.",
    passwordLabel: "Password",
    submit: "Sign in",
    busy: "Signing in…",
    autoComplete: "current-password",
  },
} as const;

/**
 * Email and password sign-up and sign-in with Supabase Auth (D77). Sign-up
 * sends a confirmation link when the project requires one; otherwise it signs
 * straight in. Either way a prompt typed on the homepage opens in the editor.
 */
export function AuthForm({ mode, next, notice }: { mode: Mode; next?: string; notice?: string }) {
  const copy = COPY[mode];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const continueIn = async () => {
    let to = safeNext(next);
    if (hasPendingPrompt()) {
      try {
        to = await openPendingPrompt();
      } catch {
        // The design couldn't be created; the list still works.
      }
    }
    router.replace(to);
    router.refresh();
  };

  if (sentTo) return <CheckEmail email={sentTo} kind="signup" />;

  return (
    <>
      <AuthHeading title={copy.title} blurb={copy.blurb} />

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const email = String(data.get("email") ?? "").trim();
          const password = String(data.get("password") ?? "");
          const name = String(data.get("name") ?? "").trim();
          if (mode === "signup" && password !== String(data.get("confirm") ?? "")) {
            setError("The two passwords don't match.");
            setUnconfirmed(false);
            return;
          }
          setBusy(true);
          setError(null);
          setUnconfirmed(false);

          const auth = supabaseBrowser().auth;
          if (mode === "signup") {
            const { data: result, error: failure } = await auth.signUp({
              email,
              password,
              options: {
                data: { name },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
              },
            });
            if (failure) {
              setBusy(false);
              setError(authMessage(failure));
            } else if (result.session) {
              await continueIn();
            } else if (result.user && result.user.identities?.length === 0) {
              // Supabase hides whether an address is taken; an empty identity list means it is.
              setBusy(false);
              setError(authMessage({ code: "user_already_exists" }));
            } else {
              setSentTo(email);
            }
            return;
          }

          const { error: failure } = await auth.signInWithPassword({ email, password });
          if (failure) {
            setBusy(false);
            setError(authMessage(failure));
            setUnconfirmed(failure.code === "email_not_confirmed");
            return;
          }
          await continueIn();
        }}
        className="mt-6 space-y-3"
      >
        {notice ? <Notice tone="info">{notice}</Notice> : null}
        {error ? (
          <Notice tone="error">
            {error}{" "}
            {unconfirmed ? (
              <button
                type="button"
                onClick={async (event) => {
                  const email = String(new FormData(event.currentTarget.form!).get("email") ?? "");
                  if (!email) return;
                  const { error: failure } = await supabaseBrowser().auth.resend({
                    type: "signup",
                    email,
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                  });
                  if (failure) setError(authMessage(failure));
                  else setSentTo(email);
                }}
                className="font-medium underline underline-offset-2"
              >
                Resend the link
              </button>
            ) : null}
          </Notice>
        ) : null}

        {mode === "signup" ? (
          <TextField id="name" label="Your name" autoComplete="name" placeholder="Maya Patel" />
        ) : null}
        <TextField
          id="email"
          label="Your email"
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
        />
        <PasswordField
          id="password"
          label={copy.passwordLabel}
          placeholder="••••••••••••"
          autoComplete={copy.autoComplete}
          minLength={mode === "signup" ? MIN_PASSWORD : undefined}
          action={
            mode === "login" ? (
              <Link
                href="/forgot-password"
                className="text-[12px] text-auth-muted transition-colors hover:text-auth-ink"
              >
                Forgot password?
              </Link>
            ) : undefined
          }
        />
        {mode === "signup" ? (
          <PasswordField
            id="confirm"
            label="Confirm password"
            placeholder="••••••••••••"
            autoComplete="new-password"
            minLength={MIN_PASSWORD}
          />
        ) : null}

        <SubmitButton busy={busy}>{busy ? copy.busy : copy.submit}</SubmitButton>

        {mode === "signup" ? (
          <p className="text-center text-[12px] leading-relaxed text-auth-muted">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-auth-ink underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-auth-ink underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        ) : null}
      </form>
    </>
  );
}
