/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: '*.ibb.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    // 显式可信源：仅在配置了 ALLOWED_ORIGIN(S) 时下发 CORS，绝不与
    // Access-Control-Allow-Credentials: true 共用通配符 "*"（V8 修复）。
    // 多个源用逗号分隔；为空则不下发 CORS 头（浏览器将忽略，等同无跨域）。
    const allowedOrigins = (process.env.ALLOWED_ORIGIN || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)

    const corsHeaders = allowedOrigins.length
      ? [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(', '),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Vary',
            value: 'Origin',
          },
        ]
      : []

    return [
      {
        source: '/(.*)',
        headers: [
          // 安全基础头
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // HSTS - 强制 HTTPS（含预加载提示；Cloudflare 边缘路径由面板 HSTS 覆盖）
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // CSP - 内容安全策略（修复 Burp #1/#2/#3）
          // 移除无效的 'nonce-:nonce:' 占位符与 'unsafe-inline'，
          // 显式放行受信任的 Cloudflare Web Analytics 第一方脚本。
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' https: data: i.ibb.co *.ibb.co; script-src 'self' https://static.cloudflareinsights.com; style-src 'self'; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
          // 权限策略
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // 跨域隔离
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      // CORS 头：仅作用于 /api/* 路由（V8 修复）
      {
        source: '/api/:path*',
        headers: corsHeaders,
      },
      // CSRF 保护 - Next.js 内置机制通过检查 Origin/Referer 头
      // 对于非 GET 请求，需要验证 Origin 头
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-CSRF-Token',
            value: 'required',
          },
        ],
      },
      // Burp #5 修复：敏感 API（含 /api/auth/session）禁止浏览器缓存。
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, max-age=0, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

module.exports = nextConfig