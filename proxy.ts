import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { safeNext } from "@/lib/safe-next";

/**
 * Keeps the Supabase session fresh and sends people to the right place (D77).
 * This is an optimistic check only: every API route verifies the user again
 * with `requireUser` before touching data.
 */

const PRIVATE = ["/designs", "/editor", "/admin"];
const SIGNED_OUT_ONLY = ["/login", "/signup", "/forgot-password"];

const under = (path: string, prefixes: string[]) =>
  prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  // Refreshes an expired access token and writes the new cookies.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;

  const redirect = (to: string) => {
    const target = NextResponse.redirect(new URL(to, request.url));
    for (const cookie of response.cookies.getAll()) target.cookies.set(cookie);
    return target;
  };

  if (!signedIn && under(path, PRIVATE)) {
    return redirect(`/login?next=${encodeURIComponent(path + request.nextUrl.search)}`);
  }
  if (signedIn && under(path, SIGNED_OUT_ONLY)) {
    return redirect(safeNext(request.nextUrl.searchParams.get("next")));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|llms.txt|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)"],
};
