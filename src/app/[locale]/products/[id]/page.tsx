import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import ImageGallery from './image-gallery'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()
  const t = await getTranslations('products')

  const [profile, { data: product }] = await Promise.all([
    getProfile(),
    supabase.from('products').select('*, product_images(*)').eq('id', id).single(),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (!product) notFound()

  const images = (product.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order)

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <Link href={`/${locale}/products`} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors mb-8 block">
        {t('back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ImageGallery images={images} alt={product.name} noImageLabel={t('noImage')} />

        <div>
          {product.category && (
            <p className="text-xs tracking-widest uppercase text-[#999] mb-3">{product.category}</p>
          )}
          <h1 className="text-4xl lg:text-5xl font-medium text-[#1a1a1a] mb-3 leading-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {product.name}
          </h1>
          {product.sku && (
            <p className="text-sm text-[#666] mb-4"><span className="font-medium text-[#1a1a1a]">{t('sku')}:</span> {product.sku}</p>
          )}
          {product.description && (
            <p className="text-sm text-[#555] leading-relaxed mb-8 border-t border-[#e8e4de] pt-6">{product.description}</p>
          )}
          <div className="border-t border-[#e8e4de] pt-6">
            <p className="text-sm text-[#76777d] leading-relaxed mb-5">
              {locale === 'ko'
                ? '가격표를 다운로드해 주문 수량을 기입한 뒤, 발주하기에서 제출해 주세요.'
                : 'Download the price list, fill in your quantities, and submit it on the order page.'}
            </p>
            <Link
              href={`/${locale}/order`}
              className="inline-flex items-center justify-center gap-2 w-full text-white py-3.5 text-xs font-semibold tracking-[0.1em] uppercase rounded hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0F172A' }}
            >
              {locale === 'ko' ? '발주하기' : 'Place an Order'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
