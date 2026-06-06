'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<{ id: string; role: string; full_name: string | null } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // 초기 로드
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setProfile(null); return }
      supabase.from('profiles').select('id, role, full_name').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data))
    })

    // 로그인/로그아웃 시 profile 갱신
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) { setProfile(null); return }
      supabase.from('profiles').select('id, role, full_name').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data))
    })

    return () => subscription.unsubscribe()
  }, [])

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!profile) return null

  const isActive = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href)
    return active ? 'text-black font-semibold' : 'text-gray-500 hover:text-black'
  }

  const adminLinks: { href: string; label: string; exact?: boolean }[] = [
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/inquiries', label: 'Inquiries' },
  ]

  const customerLinks: { href: string; label: string; exact?: boolean }[] = [
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'My Orders' },
    { href: '/inquiries', label: 'Inquiries' },
  ]

  const links = profile.role === 'admin' ? adminLinks : customerLinks

  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href={profile.role === 'admin' ? '/admin' : '/products'} className="font-bold text-lg tracking-tight">
          Nunas B2B
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`transition-colors ${isActive(link.href, link.exact)}`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* 데스크톱 우측 */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <span className="text-gray-400">{profile.full_name}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-black transition-colors">
            Logout
          </button>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-black"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-2 text-sm transition-colors ${isActive(link.href, link.exact)}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t pt-3 mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">{profile.full_name}</span>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-black transition-colors">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
