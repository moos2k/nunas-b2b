import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LocaleSwitcher from '@/components/locale-switcher'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') redirect(`/${locale}/admin`)
    redirect(`/${locale}/products`)
  }

  const isKo = locale === 'ko'

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div>
            <span className="text-xl font-light tracking-[0.25em] uppercase text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Jay-On
            </span>
            <span className="text-xs text-white/40 ml-2 tracking-widest uppercase hidden sm:inline">International</span>
          </div>
          <div className="flex items-center gap-6">
            <LocaleSwitcher />
            <Link href={`/${locale}/login`}
              className="text-xs tracking-widest uppercase text-white/60 hover:text-white transition-colors">
              {isKo ? '로그인' : 'Sign In'}
            </Link>
            <Link href={`/${locale}/signup`}
              className="text-xs tracking-widest uppercase bg-white text-black px-4 py-2 hover:bg-white/90 transition-colors">
              {isKo ? '가입 신청' : 'Apply'}
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#1a1408]" />
        {/* 골드 글로우 */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#C9A96E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 w-full">
          <div className="max-w-4xl">
            <p className="text-xs tracking-[0.4em] uppercase text-[#C9A96E] mb-8">
              {isKo ? '한국 화장품 도매 유통' : 'Korean Cosmetics Wholesale Distribution'}
            </p>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light leading-[1.05] mb-8"
              style={{ fontFamily: 'var(--font-cormorant)' }}>
              {isKo ? (
                <>
                  한국의 뷰티를<br />
                  <span className="italic text-[#C9A96E]">세계로.</span>
                </>
              ) : (
                <>
                  Korea&apos;s Finest<br />
                  <span className="italic text-[#C9A96E]">Beauty, Global.</span>
                </>
              )}
            </h1>
            <p className="text-base text-white/50 leading-relaxed mb-12 max-w-xl">
              {isKo
                ? 'Jay-On International은 엄선된 한국 화장품 브랜드를 전 세계 B2B 바이어에게 공급합니다. 가격표 열람부터 발주까지, 모든 과정이 이 플랫폼 하나로.'
                : 'Jay-On International supplies curated Korean beauty brands to B2B buyers worldwide. From price lists to purchase orders — all in one platform.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/${locale}/login`}
                className="inline-flex items-center justify-center gap-2 bg-[#C9A96E] text-black px-8 py-4 text-sm tracking-wider uppercase font-medium hover:bg-[#d4b87a] transition-colors">
                {isKo ? '바이어 로그인' : 'Buyer Login'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href={`/${locale}/signup`}
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 text-sm tracking-wider uppercase hover:border-white/50 transition-colors">
                {isKo ? '가입 신청하기' : 'Request Access'}
              </Link>
            </div>
          </div>

          {/* 우측 장식 카드 */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 w-64">
            {[
              { num: '200+', label: isKo ? '취급 브랜드' : 'Brands' },
              { num: '30+', label: isKo ? '수출 국가' : 'Countries' },
              { num: '10yr', label: isKo ? '업력' : 'Experience' },
            ].map((s) => (
              <div key={s.num} className="border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-4">
                <p className="text-3xl font-light text-[#C9A96E]" style={{ fontFamily: 'var(--font-cormorant)' }}>{s.num}</p>
                <p className="text-xs text-white/40 tracking-widest uppercase mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 스크롤 힌트 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── TICKER (움직이는 브랜드 태그) ── */}
      <div className="bg-[#C9A96E] py-3 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {Array(3).fill(['LANEIGE', 'COSRX', 'INNISFREE', 'SULWHASOO', 'SOME BY MI', 'ANUA', 'SKIN1004', 'ABIB', 'ROUND LAB', 'BEAUTY OF JOSEON']).flat().map((b, i) => (
            <span key={i} className="text-black text-xs tracking-[0.3em] uppercase font-medium">{b} ·</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#0f0f0f] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-[#C9A96E] mb-4">
              {isKo ? '이용 방법' : 'How It Works'}
            </p>
            <h2 className="text-4xl lg:text-5xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {isKo ? '간단한 3단계' : 'Simple 3 Steps'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              {
                step: '01',
                title: isKo ? '가입 신청' : 'Apply',
                desc: isKo ? '사업자 정보를 제출하면 담당자 검토 후 계정을 활성화해 드립니다.' : 'Submit your business info. Our team reviews and activates your account.',
              },
              {
                step: '02',
                title: isKo ? '브랜드 탐색' : 'Browse Brands',
                desc: isKo ? '취급 브랜드의 가격표를 열람하고, 관심 상품을 확인하세요.' : 'Browse our brand catalog and download price lists for products you need.',
              },
              {
                step: '03',
                title: isKo ? '발주 & 확정' : 'Order & Confirm',
                desc: isKo ? '발주서를 제출하면 담당자가 견적을 확정하고 안내드립니다.' : 'Submit your purchase order. We confirm the quote and guide you through.',
              },
            ].map((item) => (
              <div key={item.step} className="px-10 py-12">
                <p className="text-5xl font-light text-white/10 mb-6" style={{ fontFamily: 'var(--font-cormorant)' }}>{item.step}</p>
                <h3 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY JAY-ON ── */}
      <section className="bg-white text-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-[#C9A96E] mb-6">
                {isKo ? '왜 제이온인가' : 'Why Jay-On'}
              </p>
              <h2 className="text-4xl lg:text-5xl font-light leading-tight mb-8" style={{ fontFamily: 'var(--font-cormorant)' }}>
                {isKo
                  ? <>K-뷰티 시장의<br /><span className="italic">신뢰할 수 있는 파트너</span></>
                  : <>Your Trusted Partner<br /><span className="italic">in K-Beauty</span></>}
              </h2>
              <p className="text-sm text-[#555] leading-relaxed mb-8">
                {isKo
                  ? '10년 이상의 한국 화장품 수출 경험을 바탕으로, 전 세계 바이어에게 검증된 브랜드와 경쟁력 있는 가격을 제공합니다. 단순한 공급을 넘어, 비즈니스 성장을 함께하는 파트너십을 지향합니다.'
                  : 'With over a decade of Korean cosmetics export experience, we connect global buyers with verified brands and competitive pricing. We go beyond supply — we build lasting partnerships.'}
              </p>
              <Link href={`/${locale}/signup`}
                className="inline-flex items-center gap-2 text-sm tracking-wider uppercase border-b border-[#0a0a0a] pb-1 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-colors">
                {isKo ? '지금 시작하기' : 'Get Started'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🌏', title: isKo ? '글로벌 네트워크' : 'Global Network', desc: isKo ? '인도네시아, 동남아, 중동, 미주 등 30개국 이상 수출' : 'Exporting to 30+ countries across SEA, MENA, and Americas' },
                { icon: '✓', title: isKo ? '검증된 브랜드' : 'Verified Brands', desc: isKo ? '정품 인증 및 성분 검증 완료 브랜드만 취급' : 'Only authentic, ingredient-verified Korean brands' },
                { icon: '📋', title: isKo ? '투명한 가격' : 'Clear Pricing', desc: isKo ? '브랜드별 가격표 제공, 숨겨진 비용 없음' : 'Brand price lists provided, no hidden fees' },
                { icon: '💬', title: isKo ? '전담 담당자' : 'Dedicated Support', desc: isKo ? '주문부터 배송까지 전담 담당자가 함께' : 'Dedicated account manager from order to delivery' },
              ].map((item) => (
                <div key={item.title} className="bg-[#FAF9F7] p-6 rounded-none border border-[#e8e4de]">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h4 className="text-sm font-semibold text-[#1a1a1a] mb-2">{item.title}</h4>
                  <p className="text-xs text-[#888] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A96E]/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-[#C9A96E] mb-6">
            {isKo ? '지금 시작하세요' : 'Get Started Today'}
          </p>
          <h2 className="text-5xl lg:text-6xl font-light mb-8" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {isKo ? '첫 발주를 시작할 준비가 되셨나요?' : 'Ready to Place Your First Order?'}
          </h2>
          <p className="text-sm text-white/40 mb-12 max-w-lg mx-auto leading-relaxed">
            {isKo
              ? '이미 계정이 있으신가요? 로그인하여 브랜드 카탈로그를 열람하세요. 신규 바이어는 가입 신청을 통해 연락해 주세요.'
              : 'Already have an account? Sign in to browse our catalog. New buyers can apply for access below.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/login`}
              className="bg-[#C9A96E] text-black px-10 py-4 text-sm tracking-wider uppercase font-medium hover:bg-[#d4b87a] transition-colors">
              {isKo ? '로그인' : 'Sign In'}
            </Link>
            <Link href={`/${locale}/signup`}
              className="border border-white/20 text-white px-10 py-4 text-sm tracking-wider uppercase hover:border-white/50 transition-colors">
              {isKo ? '가입 신청' : 'Request Access'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-xl font-light tracking-[0.25em] uppercase mb-1" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Jay-On International
              </p>
              <p className="text-xs text-white/30">{isKo ? '한국 화장품 도매 유통' : 'Korean Cosmetics Wholesale'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 text-xs text-white/30">
              <a href="mailto:jay-on@naver.com" className="hover:text-white/60 transition-colors">jay-on@naver.com</a>
              <Link href={`/${locale}/login`} className="hover:text-white/60 transition-colors">{isKo ? '로그인' : 'Sign In'}</Link>
              <Link href={`/${locale}/signup`} className="hover:text-white/60 transition-colors">{isKo ? '가입 신청' : 'Apply'}</Link>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-xs text-white/20">
            © 2025 Jay-On International. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
