'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

const COUNTRIES = [
  'South Korea',
  'Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam', 'Philippines',
  'China', 'Japan', 'Taiwan', 'Hong Kong', 'India', 'UAE', 'Saudi Arabia',
  'United States', 'United Kingdom', 'Australia', 'Other',
]

export default function SignupPage() {
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const isKo = locale === 'ko'

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    full_name: '',
    company: '',
    country: '',
    business_number: '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError(isKo ? '비밀번호가 일치하지 않습니다.' : 'Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError(isKo ? '비밀번호는 8자 이상이어야 합니다.' : 'Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // 1. Supabase Auth 계정 생성
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      console.log('signup error detail:', JSON.stringify(signUpError))
      setError(signUpError?.message ?? (isKo ? '가입 중 오류가 발생했습니다.' : 'Failed to sign up.'))
      setLoading(false)
      return
    }

    // 2. profiles 테이블에 pending 상태로 등록
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role: 'customer',
      status: 'pending',
      full_name: form.full_name,
      company: form.company,
      country: form.country,
    })

    if (profileError) {
      setError(isKo ? '프로필 등록 중 오류가 발생했습니다.' : 'Failed to save profile.')
      setLoading(false)
      return
    }

    // 3. signup_requests에도 상세 정보 저장 (관리자 참고용)
    await supabase.from('signup_requests').insert({
      email: form.email,
      full_name: form.full_name,
      company: form.company,
      country: form.country,
      business_number: form.business_number || null,
      phone: form.phone || null,
      message: form.message || null,
    })

    // 4. 로그아웃 상태로 유지 (승인 전까지 접근 불가)
    await supabase.auth.signOut()

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="w-full max-w-md px-8 text-center">
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {isKo ? '신청이 완료되었습니다' : 'Application Submitted'}
          </h1>
          <p className="text-sm text-[#666] leading-relaxed mb-8">
            {isKo
              ? '가입 신청이 접수되었습니다. 담당자 검토 후 승인 안내를 드리겠습니다. 승인 후 동일한 이메일과 비밀번호로 로그인하실 수 있습니다.'
              : 'Your application has been received. We will review it and notify you once approved. You can then log in with the email and password you just entered.'}
          </p>
          <Link href={`/${locale}/login`} className="text-sm text-[#1a1a1a] hover:underline">
            {isKo ? '로그인 페이지로 →' : 'Go to Login →'}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] py-16 px-6">
      <div className="max-w-lg mx-auto">
        <div className="mb-10">
          <Link href={`/${locale}`} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors block mb-8">
            ← {isKo ? '홈으로' : 'Back to Home'}
          </Link>
          <p className="text-xs tracking-[0.3em] uppercase text-[#999] mb-3">
            {isKo ? '바이어 등록' : 'Buyer Registration'}
          </p>
          <h1 className="text-4xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {isKo ? '회원가입 신청' : 'Create Account'}
          </h1>
          <p className="text-sm text-[#888] mt-3">
            {isKo
              ? '신청 후 담당자 검토를 거쳐 계정이 활성화됩니다.'
              : 'Your account will be activated after review by our team.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 로그인 정보 */}
          <div className="space-y-6">
            <p className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest border-b-2 border-[#1a1a1a] pb-2 mb-2">
              {isKo ? '로그인 정보' : 'Account Info'}
            </p>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                {isKo ? '이메일' : 'Email'} <span className="text-red-400">*</span>
              </label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  {isKo ? '비밀번호' : 'Password'} <span className="text-red-400">*</span>
                </label>
                <input type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={isKo ? '8자 이상' : 'Min. 8 characters'}
                  className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors placeholder:text-[#bbb]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  {isKo ? '비밀번호 확인' : 'Confirm Password'} <span className="text-red-400">*</span>
                </label>
                <input type="password" required value={form.passwordConfirm}
                  onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                  className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors" />
              </div>
            </div>
          </div>

          {/* 사업자 정보 */}
          <div className="space-y-6">
            <p className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest border-b-2 border-[#1a1a1a] pb-2 mb-2">
              {isKo ? '사업자 정보' : 'Business Info'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  {isKo ? '담당자 이름' : 'Contact Name'} <span className="text-red-400">*</span>
                </label>
                <input type="text" required value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  {isKo ? '회사명' : 'Company Name'} <span className="text-red-400">*</span>
                </label>
                <input type="text" required value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  {isKo ? '국가' : 'Country'} <span className="text-red-400">*</span>
                </label>
                <select required value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors">
                  <option value="">{isKo ? '선택' : 'Select'}</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  {isKo ? '사업자 번호' : 'Business Reg. No.'}
                </label>
                <input type="text" value={form.business_number}
                  onChange={(e) => setForm({ ...form, business_number: e.target.value })}
                  className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                {isKo ? '연락처' : 'Phone Number'}
              </label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+62 xxx xxxx xxxx"
                className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors placeholder:text-[#bbb]" />
            </div>
          </div>

          {/* 메시지 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              {isKo ? '추가 메시지 (선택)' : 'Additional Message (optional)'}
            </label>
            <textarea value={form.message} rows={3}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={isKo ? '관심 상품, 예상 주문량 등' : 'Products of interest, expected order volume, etc.'}
              className="w-full border border-[#d1d5db] bg-white rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors resize-none placeholder:text-[#bbb]" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm tracking-wider uppercase hover:bg-[#333] transition-colors disabled:opacity-40">
            {loading
              ? (isKo ? '신청 중...' : 'Submitting...')
              : (isKo ? '가입 신청하기' : 'Submit Application')}
          </button>

          <p className="text-center text-xs text-[#888]">
            {isKo ? '이미 계정이 있으신가요?' : 'Already have an account?'}{' '}
            <Link href={`/${locale}/login`} className="text-[#1a1a1a] hover:underline">
              {isKo ? '로그인' : 'Sign In'}
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
