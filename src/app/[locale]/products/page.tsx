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
      .select('*, product_images(*)')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (error) return <p>Failed to load brands.</p>

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* 헤더 */}
      <div className="mb-8 border-b border-[#e8e4de] pb-6">
        <h1 className="text-4xl font-light text-[#1a1a1a]" style={{ fontFamily: 'var(--font-cormorant)' }}>
          {isKo ? '브랜드' : 'Brands'}
        </h1>
        <p className="text-sm text-[#666] mt-1">
          {brands?.length ?? 0} {isKo ? '개 브랜드' : 'brands'}
        </p>
      </div>

      <BrandsClient brands={brands ?? []} locale={locale} isKo={isKo} />
    </main>
  )
}
