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

    return [
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
