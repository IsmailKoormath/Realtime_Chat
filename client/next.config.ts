/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "your-image-hosting-domain.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    NEXT_PUBLIC_SERVER_URL:
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
  },
};

module.exports = nextConfig;
