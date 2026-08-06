/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      "../build/polyfills/polyfill-module": "./lib/modern-browser-polyfills.js",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },
  async headers() {
    const cacheControl =
      "public, max-age=2592000, stale-while-revalidate=86400"

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const wsUrl = apiUrl.replace(/^https?:/, "wss:")

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://tools.applemediaservices.com https://play.google.com",
      "font-src 'self' data:",
      `connect-src 'self' ${apiUrl} ${wsUrl} https://api.cloudinary.com https://*.stripe.com https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
      "frame-src https://js.stripe.com https://*.stripe.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://*.stripe.com",
    ].join("; ")

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ]

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_vercel/insights/script.js",
        headers: [{ key: "Cache-Control", value: cacheControl }],
      },
      {
        source:
          "/:path*.:extension(ico|png|jpg|jpeg|gif|svg|webp|avif|mp4|webm|woff|woff2)",
        headers: [{ key: "Cache-Control", value: cacheControl }],
      },
    ]
  },
}

export default nextConfig
