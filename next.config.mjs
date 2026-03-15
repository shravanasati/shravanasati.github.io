/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/blog/[slug]/opengraph-image": ["./content/**/*.mdx"],
  },
};

export default nextConfig;
