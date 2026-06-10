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
    <main className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-6">
      <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded p-10">
        <div className="text-center mb-12">
          <p className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-montserrat)', color: '#0F172A' }}>
            JAY-ON
          </p>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#76777d] mt-1">International</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#45464d] mb-2">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[#c6c6cd] bg-white px-3 py-2.5 text-sm rounded focus:outline-none focus:border-b-2 focus:border-b-[#0F172A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#45464d] mb-2">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[#c6c6cd] bg-white px-3 py-2.5 text-sm rounded focus:outline-none focus:border-b-2 focus:border-b-[#0F172A] transition-colors"
            />
          </div>
          {error && <p className="text-[#ba1a1a] text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 text-xs font-semibold tracking-[0.1em] uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#0F172A' }}
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>
      </div>
    </main>
  )
}
