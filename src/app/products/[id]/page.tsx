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

  const images = product.product_images ?? []

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <Link href="/products" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← Back to Products
      </Link>

      <div className="border rounded-lg p-6 sm:p-8 bg-white">

        {/* 이미지 */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={images[0].url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2">
                {images.slice(1).map((img: any) => (
                  <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={img.url} alt={product.name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6">
          {product.currency} {Number(product.base_price).toFixed(2)}
        </p>

        {product.description && (
          <p className="text-gray-600 mb-6">{product.description}</p>
        )}

        <div className="text-sm text-gray-400 space-y-1">
          {product.sku && <p>SKU: {product.sku}</p>}
        </div>

        <OrderButton
          productId={product.id}
          productName={product.name}
          unitPrice={Number(product.base_price)}
          currency={product.currency}
        />
      </div>
    </main>
  )
}
