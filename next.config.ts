import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    transpilePackages: ['next-mdx-remote'],
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.buymeacoffee.com',
            },
        ],
        unoptimized: true
    },
    trailingSlash: true,
    /** 开发时直连 OpenAI 会 CORS；浏览器请求 /openai-proxy/* 转发到 api.openai.com */
    async rewrites() {
        return [
            {
                source: '/openai-proxy/:path*',
                destination: 'https://api.openai.com/:path*',
            },
        ];
    },
};

export default nextConfig;
