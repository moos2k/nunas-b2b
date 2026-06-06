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
    <main className="max-w-6xl mx-auto px-6 py-12">
      <Link href="/products" className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors mb-8 block">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 이미지 */}
        <div>
          <div className="aspect-square bg-[#F0EDE8] relative overflow-hidden">
            {images.length > 0 ? (
              <Image src={images[0].url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#bbb] text-xs tracking-widest uppercase">No Image</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-2">
              {images.slice(1).map((img: any) => (
                <div key={img.id} className="w-20 h-20 bg-[#F0EDE8] relative overflow-hidden">
                  <Image src={img.url} alt={product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div>
          {product.category && (
            <p className="text-xs tracking-widest uppercase text-[#999] mb-3">{product.category}</p>
          )}
          <h1
            className="text-4xl font-medium text-[#1a1a1a] mb-3 leading-tight"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {product.name}
          </h1>

          {/* 가격 - 크고 명확하게 */}
          <div className="bg-[#F0EDE8] rounded px-5 py-4 mb-6 inline-block">
            <p className="text-xs text-[#888] mb-1 uppercase tracking-widest">Unit Price</p>
            <p className="text-3xl font-semibold text-[#1a1a1a]">
              {product.currency} {Number(product.base_price).toFixed(2)}
            </p>
          </div>

          {product.sku && (
            <p className="text-sm text-[#666] mb-4">
              <span className="font-medium text-[#1a1a1a]">SKU:</span> {product.sku}
            </p>
          )}

          {product.description && (
            <p className="text-sm text-[#555] leading-relaxed mb-8 border-t border-[#e8e4de] pt-6">
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
