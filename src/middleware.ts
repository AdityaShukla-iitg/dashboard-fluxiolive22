import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  
  const sessionCookie = request.cookies.get("session")?.value;
  let session = null;
  if (sessionCookie) {
    session = await decrypt(sessionCookie);
  }

  // Admin routing
  if (path.startsWith("/admin")) {
    if (path === "/admin/login") {
      if (session?.type === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }
    
    if (session?.type !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  // Client routing: /[slug]/dashboard
  const slugMatch = path.match(/^\/([^\/]+)\/dashboard/);
  if (slugMatch) {
    const slug = slugMatch[1];
    const isAuthorizedClient = session?.type === "client" && session.slug === slug;
    const isAuthorizedAdmin = session?.type === "admin";

    if (!isAuthorizedClient && !isAuthorizedAdmin) {
      return NextResponse.redirect(new URL(`/${slug}`, request.url));
    }
    return response;
  }
  
  // Client login root routing: /[slug]
  const isClientLogin = path.match(/^\/([^\/]+)$/);
  if (isClientLogin) {
    const slug = isClientLogin[1];
    // Don't intercept _next or api
    if (slug === "_next" || slug === "api" || slug === "favicon.ico") return response;
    
    if (session?.type === "client" && session.slug === slug) {
      return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
