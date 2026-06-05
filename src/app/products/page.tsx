import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProductsPage() {
  const supabase = await createClient()

  const [profile, { data: products, error }] = await Promise.all([
    getProfile(),
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
  ])

  if (!profile) redirect('/login')
  if (error) return <p>상품을 불러오지 못했습니다.</p>

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="border rounded-lg p-5 hover:shadow-md transition-shadow block bg-white"
          >
            <p className="text-xs text-gray-400 mb-1">{product.category}</p>
            <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
            <p className="text-base font-bold">
              {product.currency} {Number(product.base_price).toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
