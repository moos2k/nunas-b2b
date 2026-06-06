import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function InquiriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const t = await getTranslations('inquiries')

  const [profile, { data: inquiries }] = await Promise.all([
    getProfile(),
    supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect(`/${locale}/login`)

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-8 border-b border-[#e8e4de] pb-6">
        <h1 className="text-4xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>{t('title')}</h1>
        <Link href={`/${locale}/inquiries/new`} className="border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 text-[10px] tracking-[0.2em] uppercase hover:bg-[#1a1a1a] hover:text-[#FAF9F7] transition-all duration-300">
          {t('newInquiry')}
        </Link>
      </div>

      <div className="divide-y divide-[#e8e4de]">
        {inquiries?.map((inq) => (
          <Link key={inq.id} href={`/${locale}/inquiries/${inq.id}`} className="flex justify-between items-center py-6 group">
            <div>
              <p className="text-sm font-light text-[#1a1a1a] group-hover:opacity-60 transition-opacity">{inq.title}</p>
              <p className="text-[10px] text-[#aaa] mt-1">
                {new Date(inq.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#888] shrink-0 ml-4">{t(`status.${inq.status}`)}</p>
          </Link>
        ))}
        {(!inquiries || inquiries.length === 0) && (
          <p className="text-center text-[#aaa] py-20 text-sm">{t('noInquiries')}</p>
        )}
      </div>
    </main>
  )
}
