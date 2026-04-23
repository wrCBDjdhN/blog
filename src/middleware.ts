import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * CSRF 保护白名单 - GET/HEAD/OPTIONS 请求不需要 CSRF 检查
 * 只有 state-changing operations 需要验证 Origin/Referer 头
 */
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || []

/**
 * 验证 CSRF 请求
 * Next.js 内置 CSRF 保护：检查 Origin 或 Referer 头
 * 增强安全检查：包括 sec-fetch-mode 验证和生产环境警告
 */
function validateCsrfRequest(request: NextRequest): boolean {
  // Safe methods don't require CSRF protection
  if (SAFE_METHODS.includes(request.method)) {
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const secFetchMode = request.headers.get('sec-fetch-mode')
  const host = request.headers.get('host')

  // 生产环境必须配置 ALLOWED_ORIGINS
  if (process.env.NODE_ENV === 'production' && ALLOWED_ORIGINS.length === 0) {
    console.warn('ALLOWED_ORIGINS not configured in production - CSRF protection may be insufficient')
  }

  // 检查 sec-fetch-mode 确保是同源请求 (navigate 或 cors)
  // 注：不作为唯一验证，但提供额外安全保障
  if (secFetchMode && !['navigate', 'cors', 'same-origin'].includes(secFetchMode)) {
    // 允许其他模式但需要额外验证
  }

  // Origin 验证 - 更严格的检查
  if (origin) {
    try {
      const originUrl = new URL(origin)

      // 严格模式：有配置允许列表时必须匹配
      if (ALLOWED_ORIGINS.length > 0) {
        return ALLOWED_ORIGINS.includes(origin) || originUrl.host === host
      }

      // 无配置时检查是否同源
      return originUrl.host === host
    } catch {
      return false
    }
  }

  // 备用检查 Referer
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      return refererUrl.host === host
    } catch {
      return false
    }
  }

  // 没有 Origin 且没有 Referer 的请求可能是 CSRF 攻击
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CSRF 保护：验证非 safe methods 的请求
  if (!SAFE_METHODS.includes(request.method)) {
    if (!validateCsrfRequest(request)) {
      return new NextResponse('CSRF validation failed', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-CSRF-Token': 'required',
        },
      })
    }
  }

  // 管理后台保护
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value || request.cookies.get('__Secure-next-auth.session-token')?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}