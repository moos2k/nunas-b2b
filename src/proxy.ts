import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 정적 파일·API·메타데이터 파일 제외 (로케일 prefix 붙으면 안 되는 경로들)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/icon' ||
    pathname === '/apple-icon' ||
    pathname === '/icon-192' ||
    pathname === '/icon-512' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 루트 경로는 next-intl이 처리
  const intlResponse = intlMiddleware(request)
  if (intlResponse) return intlResponse

  // Supabase 세션 갱신
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
