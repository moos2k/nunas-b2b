'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<{ role: string; full_name: string | null } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

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
    { href: '/admin', label: '대시보드', exact: true },
    { href: '/admin/products', label: '상품 관리' },
    { href: '/admin/orders', label: '주문 관리' },
    { href: '/admin/inquiries', label: '문의 관리' },
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
        <Link
          href={profile.role === 'admin' ? '/admin' : '/products'}
          className="font-bold text-lg tracking-tight"
        >
          Nunas B2B
        </Link>

        <div className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${isActive(link.href, link.exact)}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400 hidden sm:block">{profile.full_name}</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-black transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
