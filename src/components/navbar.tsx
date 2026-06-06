'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import LocaleSwitcher from './locale-switcher'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<{ id: string; role: string; full_name: string | null } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // pathname에서 locale 추출 (/en/products → en)
  const locale = pathname.split('/')[1] || 'en'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setProfile(null); return }
      supabase.from('profiles').select('id, role, full_name').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) { setProfile(null); return }
      supabase.from('profiles').select('id, role, full_name').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data))
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  // 랜딩 페이지에선 숨김
  if (pathname === '/' || pathname === `/${locale}` || !profile) return null

  const isActive = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href)
    return active ? 'text-[#1a1a1a] font-semibold' : 'text-[#888] hover:text-[#1a1a1a]'
  }

  const adminLinks: { href: string; label: string; exact?: boolean }[] = [
    { href: `/${locale}/admin`, label: 'Dashboard', exact: true },
    { href: `/${locale}/admin/products`, label: 'Products' },
    { href: `/${locale}/admin/orders`, label: 'Orders' },
    { href: `/${locale}/admin/inquiries`, label: 'Inquiries' },
  ]

  const customerLinks: { href: string; label: string; exact?: boolean }[] = [
    { href: `/${locale}/products`, label: locale === 'ko' ? '상품' : 'Products' },
    { href: `/${locale}/orders`, label: locale === 'ko' ? '내 주문' : 'My Orders' },
    { href: `/${locale}/inquiries`, label: locale === 'ko' ? '문의' : 'Inquiries' },
  ]

  const links = profile.role === 'admin' ? adminLinks : customerLinks

  return (
    <nav className="border-b border-[#e8e4de] bg-[#FAF9F7] sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={profile.role === 'admin' ? `/${locale}/admin` : `/${locale}/products`}
          className="font-light tracking-[0.2em] uppercase text-sm"
          style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', letterSpacing: '0.25em' }}>
          Nunas
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`transition-colors ${isActive(link.href, link.exact)}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs tracking-widest uppercase">
          <LocaleSwitcher />
          <span className="text-[#aaa]">{profile.full_name}</span>
          <button onClick={handleLogout} className="text-[#888] hover:text-[#1a1a1a] transition-colors">
            {locale === 'ko' ? '로그아웃' : 'Logout'}
          </button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-500 hover:text-black" aria-label="Toggle menu">
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

      {menuOpen && (
        <div className="md:hidden border-t bg-[#FAF9F7] px-6 py-3 space-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`block py-2 text-sm transition-colors ${isActive(link.href, link.exact)}`}>
              {link.label}
            </Link>
          ))}
          <div className="border-t pt-3 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#aaa]">{profile.full_name}</span>
              <LocaleSwitcher />
            </div>
            <button onClick={handleLogout} className="text-sm text-[#888] hover:text-[#1a1a1a] transition-colors">
              {locale === 'ko' ? '로그아웃' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
