import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { CURRENT_URL_HEADER, ORIGIN_HEADER } from "./config";
import { geolocation, ipAddress } from "@vercel/functions";
import { createRouteMatcher } from "./lib/router-matcher";

// =============================
// Geo detection
// this is manual geo detection. but as we will host the app in vercel, we will use vercel geo detection
// =============================
// let geo = decodeAtob(request.cookies.get("_g")?.value ?? "") ?? null;
// let isGeoCookieMissing = false;

// if (!geo) {
//   geo = await getGeoFromIP(request);
//   isGeoCookieMissing = true;
// }

// if (isGeoCookieMissing) {
//   const geoData = {
//     country_code: geo?.country_code,
//     country: geo?.country,
//     continent_code: geo?.continent_code,
//     continent: geo?.continent,
//   };
//   response.cookies.set("_g", encodeBtoa(geoData), {
//     maxAge: 60 * 60, // 1 hour
//     path: "/",
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//   });
// }
export async function proxy(request: NextRequest) {
  // write current url in header to use it in whole application
  const hostHeader =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const fullUrl = `${proto}://${hostHeader}${request.nextUrl.pathname}`;
  const origin = `${proto}://${hostHeader}`;
  const headers = new Headers(request.headers);
  headers.set(ORIGIN_HEADER, origin);
  headers.set(CURRENT_URL_HEADER, fullUrl);

  const session = await auth.api.getSession({
    headers: headers,
  });

  const isSignInOrUpRoute = createRouteMatcher(["/sign-in", "/sign-up"])(
    request,
  );

  // If user is logged in and tries to access sign-in/up, redirect to home
  if (session?.user && isSignInOrUpRoute) {
    return NextResponse.redirect(new URL("/", request.url), { headers });
  }

  // Protect TPanel routes
  const isTPanelRoute = createRouteMatcher(["/tpanel(.*)"])(request);
  if (isTPanelRoute) {
    if (!session?.user) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", fullUrl);
      return NextResponse.redirect(signInUrl, { headers });
    }

    if (session.user.role !== "teacher" && session.user.role !== "admin") {
      return NextResponse.rewrite(new URL("/not-found", request.url), { headers });
    }
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|mp4|webm|mp3|pdf|gif|zip|webmanifest|xml|txt)).*)",
  ],
};
