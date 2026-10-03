"use client";

import { useId, useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  // The footer renders this form twice (phone and desktop layouts); ids must be unique.
  const inputId = useId();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        // Not wired to a mailing list yet.
      }}
      className="relative w-full"
    >
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
        className="h-[52px] w-full rounded-lg border border-footer-line bg-footer-field px-4 pr-12 text-[15px] text-white outline-none transition-colors placeholder:text-footer-muted focus:border-white/30"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-white/90 transition-colors hover:text-white"
      >
        <ArrowRightIcon size={18} aria-hidden />
      </button>
    </form>
  );
}
