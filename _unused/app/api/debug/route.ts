import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authClient } from "@/lib/supabase/auth";

export async function GET() {
  const store = await cookies();
  const allCookies = store.getAll();
  const authCookies = allCookies.filter(c => c.name.includes("supabase") || c.name.includes("sb-"));
  
  try {
    const client = await authClient();
    const { data, error } = await client.auth.getClaims();
    return NextResponse.json({
      authCookieCount: authCookies.length,
      authCookieNames: authCookies.map(c => c.name),
      claims: data?.claims ?? null,
      error: error?.message ?? null,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      authCookieCount: authCookies.length,
      authCookieNames: authCookies.map(c => c.name),
      thrown: String(err),
    });
  }
}
