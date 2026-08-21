import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createFragmentRedirectHref } from "@/lib/fragmentState"

const IGNORED_PREFIXES = ["/_next", "/api", "/_vercel"]
const STATIC_EXT =
  /\.(ico|png|jpg|jpeg|gif|svg|webp|avif|mp4|webm|woff|woff2|css|js|map|txt|xml|json)$/i

const fragmentKeysByPath: Record<string, readonly string[]> = {
  "/post-job": ["category", "q", "jobId"],
  "/register": ["plan"],
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const skip =
    IGNORED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    STATIC_EXT.test(pathname)

  if (!skip) {
    let normalised = pathname

    if (pathname !== "/" && pathname.endsWith("/")) {
      normalised = pathname.replace(/\/+$/, "")
    }

    if (normalised !== normalised.toLowerCase()) {
      normalised = normalised.toLowerCase()
    }

    if (normalised !== pathname) {
      const url = request.nextUrl.clone()
      url.pathname = normalised
      return NextResponse.redirect(url, 301)
    }
  }

  if (!request.nextUrl.search) return NextResponse.next()

  const fragmentKeys = fragmentKeysByPath[request.nextUrl.pathname]
  if (!fragmentKeys) return NextResponse.next()

  const destinationHref = createFragmentRedirectHref(
    request.nextUrl.pathname,
    request.nextUrl.search,
    fragmentKeys,
  )
  if (!destinationHref) return NextResponse.next()

  const destination = new URL(destinationHref, request.url)

  // Query-to-fragment migration is client-state compatibility behavior, not a permanent URL move.
  // A temporary redirect prevents browsers from caching a parameter rewrite indefinitely.
  return NextResponse.redirect(destination, 307)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
