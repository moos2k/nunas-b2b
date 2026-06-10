import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import OrderButton from './order-button'
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
          <div className="bg-[#F0EDE8] rounded px-5 py-4 mb-6 inline-block">
            <p className="text-xs text-[#888] mb-1 uppercase tracking-widest">{t('unitPrice')}</p>
            <p className="text-3xl font-semibold text-[#1a1a1a]">
              {product.currency} {Number(product.base_price).toFixed(2)}
            </p>
          </div>
          {product.sku && (
            <p className="text-sm text-[#666] mb-4"><span className="font-medium text-[#1a1a1a]">{t('sku')}:</span> {product.sku}</p>
          )}
          {product.description && (
            <p className="text-sm text-[#555] leading-relaxed mb-8 border-t border-[#e8e4de] pt-6">{product.description}</p>
          )}
          <OrderButton
            productId={product.id}
            productName={product.name}
            unitPrice={Number(product.base_price)}
            currency={product.currency}
            locale={locale}
          />
        </div>
      </div>
    </main>
  )
}
