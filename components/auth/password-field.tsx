"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

export function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  action,
  minLength,
}: {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  action?: React.ReactNode;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-auth-ink">
          {label}
        </label>
        {action}
      </div>
      <div className="relative mt-1">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-auth-border bg-auth-field px-3.5 pr-11 text-[16px] sm:text-[14px] text-auth-ink outline-none transition-colors placeholder:text-auth-muted focus:border-auth-ink/30"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-auth-muted transition-colors hover:text-auth-ink"
        >
          {visible ? (
            <EyeSlashIcon size={18} aria-hidden />
          ) : (
            <EyeIcon size={18} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
