import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import OrderButton from './order-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [profile, { data: product }] = await Promise.all([
    getProfile(),
    supabase.from('products').select('*, product_images(*)').eq('id', id).single(),
  ])

  if (!profile) redirect('/login')
  if (!product) notFound()

  const images = (product.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order)

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <Link href="/products" className="text-xs tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors mb-12 block">
        ← Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* 이미지 */}
        <div>
          <div className="aspect-square bg-[#F0EDE8] relative overflow-hidden">
            {images.length > 0 ? (
              <Image
                src={images[0].url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#ccc] text-xs tracking-widest uppercase">No Image</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-3">
              {images.slice(1).map((img: any) => (
                <div key={img.id} className="w-20 h-20 bg-[#F0EDE8] relative overflow-hidden">
                  <Image src={img.url} alt={product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col justify-center">
          {product.category && (
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] mb-4">
              {product.category}
            </p>
          )}

          <h1
            className="text-4xl lg:text-5xl font-light text-[#1a1a1a] mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {product.name}
          </h1>

          <p className="text-lg text-[#888] mb-8 font-light">
            {product.currency} {Number(product.base_price).toFixed(2)}
          </p>

          {product.sku && (
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#aaa] mb-6">
              SKU: {product.sku}
            </p>
          )}

          {product.description && (
            <p className="text-sm text-[#666] leading-relaxed mb-10 border-t border-[#e8e4de] pt-8">
              {product.description}
            </p>
          )}

          <OrderButton
            productId={product.id}
            productName={product.name}
            unitPrice={Number(product.base_price)}
            currency={product.currency}
          />
        </div>
      </div>
    </main>
  )
}
