import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session");

  // Protected routes pattern
  if (request.nextUrl.pathname.startsWith("/rooms") || request.nextUrl.pathname.startsWith("/onboarding")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Auth routes pattern (redirect to dashboard if already logged in)
  if (request.nextUrl.pathname.startsWith("/sign-in") || request.nextUrl.pathname.startsWith("/sign-up")) {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/rooms/:path*", "/onboarding/:path*", "/sign-in", "/sign-up"],
};
