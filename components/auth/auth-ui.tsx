import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";

/** The pieces every auth screen shares, so sign-in, sign-up and reset look like one flow. */

export const MIN_PASSWORD = 8;

export function AuthHeading({ title, blurb }: { title: string; blurb: ReactNode }) {
  return (
    <>
      <Wordmark href="/" label="snapdesign — home" className="text-[20px] text-auth-ink" />
      <h1 className="mt-6 text-[22px] font-semibold tracking-[-0.02em] text-auth-ink">{title}</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-auth-muted">{blurb}</p>
    </>
  );
}

export function TextField({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[13px] font-medium text-auth-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-1 h-10 w-full rounded-lg border border-auth-border bg-auth-field px-3.5 text-[16px] sm:text-[14px] text-auth-ink outline-none transition-colors placeholder:text-auth-muted focus:border-auth-ink/30"
      />
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="mt-1 h-10 w-full rounded-lg bg-auth-ink text-[14px] font-medium text-auth-card shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

/** An error or a confirmation, announced to screen readers. */
export function Notice({ tone, children }: { tone: "error" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed ${
        tone === "error" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-auth-field text-auth-ink"
      }`}
    >
      {children}
    </p>
  );
}

/** Supabase's error codes, in plain words. */
export function authMessage(error: { code?: string; message?: string } | null) {
  switch (error?.code) {
    case "invalid_credentials":
      return "That email and password don't match. Try again, or reset your password.";
    case "email_not_confirmed":
      return "Please confirm your email first — we sent you a link.";
    case "user_already_exists":
    case "email_exists":
      return "There's already an account with this email. Sign in instead.";
    case "weak_password":
      return `Choose a stronger password: at least ${MIN_PASSWORD} characters.`;
    case "same_password":
      return "That's your current password. Choose a new one.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many tries just now. Please wait a minute and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
