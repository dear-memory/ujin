import type { NextConfig } from "next";

// GitHub Pages(https://dear-memory.github.io/ujin/)에 정적 파일로 배포합니다.
const basePath = "/ujin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
