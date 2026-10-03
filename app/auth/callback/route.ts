import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { safeNext } from "@/lib/safe-next";
import { authClient } from "@/lib/supabase/auth";

/**
 * Where Supabase's email links land (D77): confirming a new account and
 * resetting a password. Handles both link styles — a PKCE `code`, or a
 * `token_hash` with its `type` — then starts the session and moves on.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"));
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  const supabase = await authClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing token") };

  if (error) return NextResponse.redirect(new URL("/login?error=link", request.url));
  const to = type === "recovery" ? "/reset-password" : next;
  return NextResponse.redirect(new URL(to, request.url));
}
