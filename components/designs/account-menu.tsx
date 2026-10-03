"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretDownIcon,
  PencilSimpleIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { initialsOf, renameAccount, signOut, useAccount } from "@/components/auth/account";

/**
 * Avatar and name for whoever signed in, with a menu to rename or sign out.
 * Reaching this page means they are in (the proxy sends everyone else to
 * sign-in), so there is never a "Sign in" here.
 */
export function AccountMenu() {
  const router = useRouter();
  const account = useAccount();
  // Shown at once after a rename; the session catches up a moment later.
  const [renamed, setRenamed] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Closing also leaves rename mode, so the menu reopens on its summary.
  const close = () => {
    setOpen(false);
    setEditing(false);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (account === undefined) return <span className="h-10 w-10 sm:w-44" aria-hidden />;

  const name = (renamed ?? account?.name ?? "").trim();
  const commitName = () => {
    const next = draftName.trim();
    if (next && next !== name) {
      setRenamed(next);
      renameAccount(next).catch(() => setRenamed(null));
    }
    setEditing(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name ? `Account: ${name}` : "Account"}
        onClick={() => (open ? close() : setOpen(true))}
        className={`flex h-10 items-center gap-2.5 rounded-full p-1 ring-1 ring-inset transition-colors sm:pr-3 ${
          open
            ? "bg-ed-raised ring-ed-dim/50"
            : "bg-ed-field/60 ring-ed-hairline hover:bg-ed-field hover:ring-ed-dim/50"
        }`}
      >
        <Avatar name={name} />
        <span className="hidden min-w-0 flex-col items-start text-left leading-tight sm:flex">
          <span className="max-w-[150px] truncate text-[13px] font-medium text-ed-text">
            {name || "Your account"}
          </span>
          <span className="max-w-[150px] truncate text-[11px] text-ed-muted">
            {name ? account?.email || "Signed in" : "Add your name"}
          </span>
        </span>
        <CaretDownIcon
          size={11}
          weight="bold"
          className={`hidden text-ed-dim transition-transform duration-200 sm:block ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-20 w-64 overflow-hidden rounded-xl border border-ed-hairline bg-ed-panel p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85)] light:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_28px_-14px_rgba(0,0,0,0.22)]"
        >
          <div className="mb-1 flex items-center gap-3 border-b border-ed-border px-2.5 pb-3 pt-2.5">
            <Avatar name={name} size="lg" />
            <div className="min-w-0 flex-1">
              {editing ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    commitName();
                  }}
                >
                  <label htmlFor="account-name" className="sr-only">
                    Your name
                  </label>
                  <input
                    id="account-name"
                    autoFocus
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onBlur={commitName}
                    placeholder="Your name"
                    autoComplete="name"
                    className="h-8 w-full rounded-md bg-ed-field px-2.5 text-[13px] text-ed-text outline-none ring-1 ring-inset ring-ed-border placeholder:text-ed-dim focus:ring-ed-blue"
                  />
                </form>
              ) : (
                <p className="truncate text-[13px] font-medium text-ed-text">
                  {name || "Add your name"}
                </p>
              )}
              {account?.email ? (
                <p className="mt-0.5 truncate text-[12px] text-ed-muted">
                  {account.email}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setDraftName(name);
              setEditing(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-ed-muted transition-colors hover:bg-ed-field hover:text-ed-text"
          >
            <PencilSimpleIcon size={15} aria-hidden />
            {name ? "Edit name" : "Add your name"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              await signOut();
              router.replace("/login");
              router.refresh();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-ed-muted transition-colors hover:bg-ed-field hover:text-ed-text"
          >
            <SignOutIcon size={15} aria-hidden />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Flat cobalt disc with initials — or a person glyph until a name is set. */
function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-cobalt font-semibold tracking-[0.02em] text-white ${
        size === "lg" ? "h-10 w-10 text-[13px]" : "h-8 w-8 text-[11px]"
      }`}
    >
      {name ? (
        initialsOf(name)
      ) : (
        <UserIcon size={size === "lg" ? 17 : 14} weight="bold" />
      )}
    </span>
  );
}
