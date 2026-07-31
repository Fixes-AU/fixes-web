import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createFragmentHref } from "@/lib/fragmentState"

const fragmentKeysByPath: Record<string, readonly string[]> = {
  "/post-job": ["category", "q", "jobId"],
  "/register": ["plan"],
}

export function proxy(request: NextRequest) {
  if (!request.nextUrl.search) return NextResponse.next()

  const fragmentKeys = fragmentKeysByPath[request.nextUrl.pathname]
  if (!fragmentKeys) return NextResponse.next()

  const fragmentState = Object.fromEntries(
    fragmentKeys.map((key) => [key, request.nextUrl.searchParams.get(key)]),
  )
  const destination = new URL(
    createFragmentHref(request.nextUrl.pathname, fragmentState),
    request.url,
  )

  return NextResponse.redirect(destination, 301)
}

export const config = {
  matcher: ["/post-job", "/register"],
}
