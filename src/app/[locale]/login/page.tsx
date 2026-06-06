'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const t = useTranslations('login')
  const isKo = locale === 'ko'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(t('error'))
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles').select('role, status').eq('id', data.user.id).single()

    // 승인 대기 중인 계정
    if (profile?.status === 'pending') {
      await supabase.auth.signOut()
      setError(isKo
        ? '가입 신청이 검토 중입니다. 승인 후 로그인하실 수 있습니다.'
        : 'Your application is under review. You will be able to log in once approved.')
      setLoading(false)
      return
    }

    if (profile?.role === 'admin') {
      router.push(`/${locale}/admin`)
    } else {
      router.push(`/${locale}/products`)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
      <div className="w-full max-w-sm px-8">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-light tracking-[0.3em] uppercase text-[#1a1a1a]" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Nunas
          </h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#888] mt-2">B2B Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#888] mb-3">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-b border-[#e8e4de] bg-transparent py-2 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#888] mb-3">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-b border-[#e8e4de] bg-transparent py-2 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-xs tracking-wide text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[#1a1a1a] text-[#1a1a1a] py-3 text-xs tracking-[0.3em] uppercase hover:bg-[#1a1a1a] hover:text-[#FAF9F7] transition-all duration-300 disabled:opacity-40"
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>
      </div>
    </main>
  )
}
