import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/products" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← Back to Products
      </Link>

      <div className="border rounded-lg p-8">
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-2xl font-semibold text-gray-700 mb-6">
          {product.currency} {Number(product.base_price).toFixed(2)}
        </p>

        {product.description && (
          <p className="text-gray-600 mb-6">{product.description}</p>
        )}

        <div className="text-sm text-gray-400 space-y-1">
          {product.sku && <p>SKU: {product.sku}</p>}
        </div>

        <button className="mt-8 w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
          Add to Order
        </button>
      </div>
    </main>
  )
}
