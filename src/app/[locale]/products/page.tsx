import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const t = await getTranslations('products')

  const [profile, { data: products, error }] = await Promise.all([
    getProfile(),
    supabase.from('products').select('*, product_images(*)').eq('is_active', true).order('created_at', { ascending: false }),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (error) return <p>Failed to load products.</p>

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10 border-b border-[#e8e4de] pb-6">
        <h1 className="text-4xl font-light text-[#1a1a1a]" style={{ fontFamily: 'var(--font-cormorant)' }}>
          {t('title')}
        </h1>
        <p className="text-sm text-[#666] mt-1">{products.length} {t('items')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {products.map((product) => {
          const firstImage = product.product_images?.[0]
          return (
            <Link key={product.id} href={`/${locale}/products/${product.id}`} className="group">
              <div className="aspect-square bg-[#F0EDE8] mb-4 overflow-hidden relative">
                {firstImage ? (
                  <Image src={firstImage.url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#bbb] text-xs tracking-widest uppercase">{t('noImage')}</span>
                  </div>
                )}
              </div>
              <div>
                {product.category && (
                  <p className="text-[11px] tracking-widest uppercase text-[#999] mb-1">{product.category}</p>
                )}
                <h2 className="text-xl font-medium text-[#1a1a1a] mb-1 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {product.name}
                </h2>
                {product.sku && <p className="text-xs text-[#999] mb-2">{t('sku')}: {product.sku}</p>}
                <p className="text-base font-semibold text-[#1a1a1a]">
                  {product.currency} {Number(product.base_price).toFixed(2)}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
      {products.length === 0 && (
        <p className="text-center text-[#aaa] py-20 text-sm">{t('noProducts')}</p>
      )}
    </main>
  )
}
