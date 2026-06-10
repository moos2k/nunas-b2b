import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LocaleSwitcher from '@/components/locale-switcher'

const NAVY = '#0F172A'
const GOLD = '#C5A059'

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
  const display = { fontFamily: 'var(--font-montserrat)' }

  return (
    <main className="min-h-screen bg-white text-[#191c1d]" style={{ fontFamily: 'var(--font-inter)' }}>

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight" style={{ ...display, color: NAVY }}>
              JAY-ON
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#76777d] hidden sm:inline">International</span>
          </div>
          <div className="flex items-center gap-6">
            <LocaleSwitcher />
            <Link href={`/${locale}/login`}
              className="text-xs font-semibold tracking-[0.1em] uppercase text-[#45464d] hover:text-[#191c1d] transition-colors">
              {isKo ? '로그인' : 'Sign In'}
            </Link>
            <Link href={`/${locale}/signup`}
              className="text-xs font-semibold tracking-[0.1em] uppercase px-5 h-10 flex items-center rounded text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: NAVY }}>
              {isKo ? '가입 신청' : 'Apply'}
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-6" style={{ color: GOLD }}>
              {isKo ? 'K-뷰티 · 건강식품 · 의료기기 글로벌 수출' : 'K-Beauty · Health · Medical Devices Export'}
            </p>
            <h1 className="text-[32px] sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight mb-6" style={{ ...display, color: NAVY }}>
              {isKo ? (
                <>한국의 우수한 브랜드를<br />전 세계로 수출합니다</>
              ) : (
                <>Korea&apos;s Finest Brands,<br />Delivered Worldwide</>
              )}
            </h1>
            <p className="text-base text-[#45464d] leading-relaxed mb-10 max-w-lg">
              {isKo
                ? 'J.ON International은 K-뷰티 브랜드, 건강기능식품, 미용 의료기기를 전 세계 온·오프라인 채널에 수출하는 전문 무역 기업입니다. 검증된 현지 파트너십과 다각화된 운송 채널로 적시·적소 공급을 실현합니다.'
                : 'J.ON International is a specialized trading company exporting K-beauty brands, health supplements, and aesthetic medical devices to online and offline channels worldwide — backed by trusted local partnerships and diversified logistics.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/${locale}/login`}
                className="inline-flex items-center justify-center gap-2 text-white px-8 h-12 text-xs font-semibold tracking-[0.1em] uppercase rounded hover:opacity-90 transition-opacity"
                style={{ backgroundColor: NAVY }}>
                {isKo ? '바이어 로그인' : 'Buyer Login'}
              </Link>
              <Link href={`/${locale}/signup`}
                className="inline-flex items-center justify-center gap-2 px-8 h-12 text-xs font-semibold tracking-[0.1em] uppercase rounded border-2 hover:bg-[#FCDEB5]/20 transition-colors"
                style={{ borderColor: GOLD, color: NAVY }}>
                {isKo ? '가입 신청하기' : 'Request Access'}
              </Link>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="lg:col-span-5 grid grid-cols-3 lg:grid-cols-1 gap-4">
            {[
              { num: '20+', label: isKo ? 'K-뷰티 수출 브랜드' : 'K-Beauty Brands' },
              { num: '10+', label: isKo ? '수출 국가' : 'Export Countries' },
              { num: '3', label: isKo ? '핵심 수출 품목' : 'Core Export Lines' },
            ].map((s) => (
              <div key={s.num} className="bg-[#F8F9FA] border border-[#E2E8F0] rounded px-6 py-6 lg:flex lg:items-center lg:gap-4">
                <p className="text-2xl lg:text-3xl font-bold" style={{ ...display, color: NAVY }}>{s.num}</p>
                <p className="text-[11px] sm:text-xs font-semibold tracking-[0.1em] uppercase text-[#76777d] mt-1 lg:mt-0">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STRIP ── */}
      <div className="border-y border-[#E2E8F0] bg-[#F8F9FA] py-4 overflow-hidden">
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {Array(3).fill(['MISSHA', 'A’PIEU', 'PYUNKANG YUL', 'DR.JART+', 'ROUND LAB', 'BEAUTY OF JOSEON', 'JUNG KWAN JANG', 'CHONG KUN DANG', 'HANMI', 'DAEWON']).flat().map((b, i) => (
            <span key={i} className="text-xs font-semibold tracking-[0.2em] uppercase text-[#76777d]">{b}</span>
          ))}
        </div>
      </div>

      {/* ── BUSINESS AREAS (3대 사업영역) ── */}
      <section className="bg-white">
        <div className="max-w-[1280px] mx-auto px-6 py-24">
          <div className="mb-16 max-w-xl">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-4" style={{ color: GOLD }}>
              {isKo ? '사업 영역' : 'Business Areas'}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ ...display, color: NAVY }}>
              {isKo ? '세 가지 핵심 수출 분야' : 'Three Core Export Lines'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                no: '01',
                title: isKo ? 'K-뷰티 브랜드 수출' : 'K-Beauty Export',
                desc: isKo
                  ? '미샤, 어퓨, 삐아, 닥터자르트, 라운드랩, 조선미녀 등 20여 개 K-COS 브랜드를 인도네시아·베트남·미주·중남미 등에 수출합니다.'
                  : 'Exporting 20+ K-COS brands — MISSHA, A’PIEU, DR.JART+, ROUND LAB, Beauty of Joseon and more — to Indonesia, Vietnam, the Americas, and Latin America.',
                tags: isKo ? ['총판', '유통'] : ['Distribution', 'Wholesale'],
              },
              {
                no: '02',
                title: isKo ? '건강기능식품 수출' : 'Health Supplements',
                desc: isKo
                  ? '정관장, 종근당, 대원제약, 한미약품 등 건강기능 및 보조식품 브랜드를 해외 온·오프라인 유통 업체에 수출 공급합니다.'
                  : 'Supplying health and functional food brands — Jung Kwan Jang, Chong Kun Dang, Daewon, Hanmi and others — to overseas online and offline distributors.',
                tags: isKo ? ['건강식품', '유통'] : ['Wellness', 'Distribution'],
              },
              {
                no: '03',
                title: isKo ? 'K-미용 의료기기 수출' : 'Aesthetic Devices',
                desc: isKo
                  ? '체외광면역치료기, 초음파 리프팅 장비 등 피부미용 의료기기를 인도네시아·말레이시아 현지 업체에 총판·수출합니다.'
                  : 'Distributing aesthetic medical devices — photoimmunotherapy systems, ultrasound lifting equipment — to local partners in Indonesia and Malaysia.',
                tags: isKo ? ['총판', '의료기기'] : ['Distribution', 'Medical'],
              },
            ].map((item) => (
              <div key={item.no} className="bg-[#F8F9FA] border border-[#E2E8F0] rounded p-8 flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow">
                <p className="text-sm font-bold mb-5" style={{ color: GOLD }}>{item.no}</p>
                <h3 className="text-xl font-bold mb-3" style={{ ...display, color: NAVY }}>{item.title}</h3>
                <p className="text-sm text-[#45464d] leading-relaxed mb-6 flex-1">{item.desc}</p>
                <div className="flex gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold tracking-[0.1em] uppercase px-2 py-1 rounded"
                      style={{ backgroundColor: '#FCDEB5', color: '#574425' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL REACH (수출 국가) ── */}
      <section className="bg-[#F8F9FA] border-t border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-4" style={{ color: GOLD }}>
                {isKo ? '글로벌 네트워크' : 'Global Reach'}
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-6" style={{ ...display, color: NAVY }}>
                {isKo
                  ? <>전 세계 현지 파트너와<br />함께하는 수출 네트워크</>
                  : <>An Export Network of<br />Trusted Local Partners</>}
              </h2>
              <p className="text-sm text-[#45464d] leading-relaxed mb-8 max-w-md">
                {isKo
                  ? '인도네시아, 베트남, 말레이시아, 미주, 중남미 등 주요 시장의 신뢰할 만한 현지 유통·판매 업체와 파트너십을 구축하고, 철저한 검증을 거쳐 온·오프라인 채널에 공급합니다. 에어 및 선박 등 다각화된 운송 채널로 적시·적소 공급을 실현합니다.'
                  : 'We build partnerships with trusted local distributors across Indonesia, Vietnam, Malaysia, the Americas, and Latin America — supplying both online and offline channels through rigorously vetted networks and diversified air and sea logistics.'}
              </p>
              <Link href={`/${locale}/signup`}
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase px-8 h-12 text-white rounded hover:opacity-90 transition-opacity"
                style={{ backgroundColor: NAVY }}>
                {isKo ? '파트너 문의하기' : 'Become a Partner'}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { en: 'Indonesia', ko: '인도네시아' },
                { en: 'Vietnam', ko: '베트남' },
                { en: 'Malaysia', ko: '말레이시아' },
                { en: 'China', ko: '중국' },
                { en: 'Taiwan', ko: '대만' },
                { en: 'Japan', ko: '일본' },
                { en: 'USA', ko: '미국' },
                { en: 'Canada', ko: '캐나다' },
                { en: 'Brazil', ko: '브라질' },
              ].map((c) => (
                <div key={c.en} className="bg-white border border-[#E2E8F0] rounded px-4 py-5 text-center">
                  <p className="text-sm font-bold" style={{ ...display, color: NAVY }}>{isKo ? c.ko : c.en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white border-t border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 py-24">
          <div className="mb-16 max-w-xl">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-4" style={{ color: GOLD }}>
              {isKo ? '이용 방법' : 'How It Works'}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ ...display, color: NAVY }}>
              {isKo ? '간단한 3단계 프로세스' : 'A Simple 3-Step Process'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E2E8F0] border border-[#E2E8F0]">
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
              <div key={item.step} className="bg-white px-8 py-10">
                <p className="text-sm font-bold mb-6" style={{ color: GOLD }}>{item.step}</p>
                <h3 className="text-xl font-bold mb-3" style={{ ...display, color: NAVY }}>{item.title}</h3>
                <p className="text-sm text-[#45464d] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="max-w-[1280px] mx-auto px-6 py-24 text-center">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-6" style={{ color: GOLD }}>
            {isKo ? '지금 시작하세요' : 'Get Started Today'}
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-6 text-white" style={display}>
            {isKo ? '첫 발주를 시작할 준비가 되셨나요?' : 'Ready to Place Your First Order?'}
          </h2>
          <p className="text-sm text-white/60 mb-10 max-w-lg mx-auto leading-relaxed">
            {isKo
              ? '이미 계정이 있으신가요? 로그인하여 브랜드 카탈로그를 열람하세요. 신규 바이어는 가입 신청을 통해 연락해 주세요.'
              : 'Already have an account? Sign in to browse our catalog. New buyers can apply for access below.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/login`}
              className="px-10 h-12 inline-flex items-center justify-center text-xs font-semibold tracking-[0.1em] uppercase rounded text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: GOLD, color: NAVY }}>
              {isKo ? '로그인' : 'Sign In'}
            </Link>
            <Link href={`/${locale}/signup`}
              className="px-10 h-12 inline-flex items-center justify-center text-xs font-semibold tracking-[0.1em] uppercase rounded border border-white/30 text-white hover:border-white/60 transition-colors">
              {isKo ? '가입 신청' : 'Request Access'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-lg font-bold tracking-tight mb-1" style={{ ...display, color: NAVY }}>
                J.ON INTERNATIONAL
              </p>
              <p className="text-xs text-[#76777d]">{isKo ? 'K-뷰티 · 건강식품 · 의료기기 글로벌 수출' : 'K-Beauty · Health · Medical Devices Global Export'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 text-xs font-semibold tracking-[0.05em] uppercase text-[#76777d]">
              <a href="mailto:jay-on@naver.com" className="hover:text-[#191c1d] transition-colors">jay-on@naver.com</a>
              <Link href={`/${locale}/login`} className="hover:text-[#191c1d] transition-colors">{isKo ? '로그인' : 'Sign In'}</Link>
              <Link href={`/${locale}/signup`} className="hover:text-[#191c1d] transition-colors">{isKo ? '가입 신청' : 'Apply'}</Link>
            </div>
          </div>
          <div className="border-t border-[#E2E8F0] mt-8 pt-8 text-xs text-[#c6c6cd]">
            © 2025 J.ON International. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
