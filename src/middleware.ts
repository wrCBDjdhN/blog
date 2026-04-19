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
 */
function validateCsrfRequest(request: NextRequest): boolean {
  // Safe methods don't require CSRF protection
  if (SAFE_METHODS.includes(request.method)) {
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // 检查 Origin 头
  if (origin) {
    const originUrl = new URL(origin)
    // 验证 origin 在允许列表中，或者与主机匹配（同源请求）
    if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
      // 如果配置了允许列表但 origin 不在其中，验证是否为同源
      const host = request.headers.get('host')
      if (originUrl.host !== host) {
        return false
      }
    }
    return true
  }

  // 如果没有 Origin，检查 Referer
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const host = request.headers.get('host')
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