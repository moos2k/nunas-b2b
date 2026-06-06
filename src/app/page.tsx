import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인된 경우 역할에 따라 이동
  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') redirect('/admin')
    redirect('/products')
  }

  // 로그인 안 된 경우 랜딩 페이지 표시
  return (
    <main className="min-h-screen bg-[#FAF9F7]">

      {/* 헤더 */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <span
          className="text-2xl font-light tracking-[0.3em] uppercase"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Nunas
        </span>
        <Link
          href="/login"
          className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
        >
          Sign In →
        </Link>
      </header>

      {/* 히어로 섹션 */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#999] mb-6">
            Korean Cosmetics · B2B Platform
          </p>
          <h1
            className="text-5xl lg:text-6xl font-light text-[#1a1a1a] leading-tight mb-8"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Premium Cosmetics
            <br />
            <span className="italic">for Global Buyers</span>
          </h1>
          <p className="text-base text-[#666] leading-relaxed mb-10 max-w-md">
            We partner with select international buyers to bring Korea&apos;s finest cosmetics to the world. Browse our curated catalog, place orders, and manage your account — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="bg-[#1a1a1a] text-white px-8 py-3.5 text-sm tracking-wider uppercase hover:bg-[#333] transition-colors text-center"
            >
              Sign In
            </Link>
            <a
              href="mailto:jay-on@naver.com"
              className="border border-[#1a1a1a] text-[#1a1a1a] px-8 py-3.5 text-sm tracking-wider uppercase hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 text-center"
            >
              Request Access
            </a>
          </div>
        </div>

        {/* 우측 이미지 플레이스홀더 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-[3/4] bg-[#EDE8E3]" />
          <div className="aspect-[3/4] bg-[#E5DED8] mt-8" />
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="border-t border-[#e8e4de] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div>
              <p
                className="text-2xl font-light text-[#1a1a1a] mb-3"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Curated Selection
              </p>
              <p className="text-sm text-[#666] leading-relaxed">
                Hand-picked Korean skincare and cosmetics, sourced directly from trusted manufacturers.
              </p>
            </div>
            <div>
              <p
                className="text-2xl font-light text-[#1a1a1a] mb-3"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Simple Ordering
              </p>
              <p className="text-sm text-[#666] leading-relaxed">
                Browse products, submit orders, and track status — all through a clean, intuitive platform.
              </p>
            </div>
            <div>
              <p
                className="text-2xl font-light text-[#1a1a1a] mb-3"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Dedicated Support
              </p>
              <p className="text-sm text-[#666] leading-relaxed">
                Our team is here to help with product questions, pricing, and logistics at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#999] mb-6">Get Started</p>
        <h2
          className="text-4xl font-light text-[#1a1a1a] mb-6"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Ready to place your first order?
        </h2>
        <p className="text-sm text-[#666] mb-10 max-w-md mx-auto leading-relaxed">
          Already have an account? Sign in to browse our catalog and submit orders. New buyers can reach out to request access.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-[#1a1a1a] text-white px-10 py-3.5 text-sm tracking-wider uppercase hover:bg-[#333] transition-colors"
          >
            Sign In
          </Link>
          <a
            href="mailto:jay-on@naver.com"
            className="border border-[#1a1a1a] text-[#1a1a1a] px-10 py-3.5 text-sm tracking-wider uppercase hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
          >
            Request Access
          </a>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-[#e8e4de] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span
            className="text-lg font-light tracking-[0.3em] uppercase text-[#1a1a1a]"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Nunas
          </span>
          <p className="text-xs text-[#aaa]">© 2025 Nunas. All rights reserved.</p>
          <a href="mailto:jay-on@naver.com" className="text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">
            jay-on@naver.com
          </a>
        </div>
      </footer>

    </main>
  )
}
