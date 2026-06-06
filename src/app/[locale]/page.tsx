import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
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

  const t = await getTranslations('landing')
  const isKo = locale === 'ko'

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <span className="text-2xl font-light tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Nunas
        </span>
        <div className="flex items-center gap-6">
          <LocaleSwitcher />
          <Link href={`/${locale}/login`} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">
            {t('signIn')} →
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#999] mb-6">{t('tagline')}</p>
          <h1 className="text-5xl lg:text-6xl font-light text-[#1a1a1a] leading-tight mb-8" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {t('heroMain')}
            <br />
            <span className="italic">{t('heroItalic')}</span>
          </h1>
          <p className="text-base text-[#666] leading-relaxed mb-10 max-w-md">{t('description')}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/${locale}/login`} className="bg-[#1a1a1a] text-white px-8 py-3.5 text-sm tracking-wider uppercase hover:bg-[#333] transition-colors text-center">
              {t('signIn')}
            </Link>
            <Link href={`/${locale}/signup`} className="border border-[#1a1a1a] text-[#1a1a1a] px-8 py-3.5 text-sm tracking-wider uppercase hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 text-center">
              {isKo ? '회원가입' : 'Sign Up'}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-[3/4] bg-[#EDE8E3]" />
          <div className="aspect-[3/4] bg-[#E5DED8] mt-8" />
        </div>
      </section>

      <section className="border-t border-[#e8e4de] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              { title: t('feature1Title'), desc: t('feature1Desc') },
              { title: t('feature2Title'), desc: t('feature2Desc') },
              { title: t('feature3Title'), desc: t('feature3Desc') },
            ].map((f, i) => (
              <div key={i}>
                <p className="text-2xl font-light text-[#1a1a1a] mb-3" style={{ fontFamily: 'var(--font-cormorant)' }}>{f.title}</p>
                <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#999] mb-6">Get Started</p>
        <h2 className="text-4xl font-light text-[#1a1a1a] mb-6" style={{ fontFamily: 'var(--font-cormorant)' }}>{t('ctaTitle')}</h2>
        <p className="text-sm text-[#666] mb-10 max-w-md mx-auto leading-relaxed">{t('ctaDesc')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${locale}/login`} className="bg-[#1a1a1a] text-white px-10 py-3.5 text-sm tracking-wider uppercase hover:bg-[#333] transition-colors">
            {t('signIn')}
          </Link>
          <Link href={`/${locale}/signup`} className="border border-[#1a1a1a] text-[#1a1a1a] px-10 py-3.5 text-sm tracking-wider uppercase hover:bg-[#1a1a1a] hover:text-white transition-all duration-300">
            {isKo ? '회원가입' : 'Sign Up'}
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e8e4de] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-lg font-light tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-cormorant)' }}>Nunas</span>
          <p className="text-xs text-[#aaa]">© 2025 Nunas. {t('footer')}</p>
          <a href="mailto:jay-on@naver.com" className="text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">jay-on@naver.com</a>
        </div>
      </footer>
    </main>
  )
}
