import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import BrandsClient from './brands-client'

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const isKo = locale === 'ko'

  const [profile, { data: brands, error }] = await Promise.all([
    getProfile(),
    supabase
      .from('products')
      .select('*, product_images(*), price_lists(*)')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (error) return <p>Failed to load brands.</p>

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-12">
      {/* 헤더 */}
      <div className="mb-8 border-b border-[#E2E8F0] pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-montserrat)', color: '#0F172A' }}>
          {isKo ? '브랜드' : 'Brands'}
        </h1>
        <p className="text-sm text-[#76777d] mt-1">
          {brands?.length ?? 0} {isKo ? '개 브랜드' : 'brands'}
        </p>
      </div>

      <BrandsClient brands={brands ?? []} locale={locale} isKo={isKo} />
    </main>
  )
}
