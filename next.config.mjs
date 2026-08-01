/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
