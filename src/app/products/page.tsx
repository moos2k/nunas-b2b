import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProductsPage() {
  const supabase = await createClient()

  const [profile, { data: products, error }] = await Promise.all([
    getProfile(),
    supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ])

  if (!profile) redirect('/login')
  if (error) return <p>Failed to load products.</p>

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* 헤더 */}
      <div className="mb-16 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#888] mb-4">Collection</p>
        <h1
          className="text-5xl font-light text-[#1a1a1a]"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Our Products
        </h1>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {products.map((product) => {
          const firstImage = product.product_images?.[0]
          return (
            <Link key={product.id} href={`/products/${product.id}`} className="group">
              {/* 이미지 영역 */}
              <div className="aspect-square bg-[#F0EDE8] mb-5 overflow-hidden relative">
                {firstImage ? (
                  <Image
                    src={firstImage.url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#ccc] text-xs tracking-widest uppercase">No Image</span>
                  </div>
                )}
              </div>

              {/* 텍스트 */}
              <div>
                {product.category && (
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#888] mb-1">
                    {product.category}
                  </p>
                )}
                <h2
                  className="text-xl font-light text-[#1a1a1a] mb-2 group-hover:opacity-60 transition-opacity"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {product.name}
                </h2>
                <p className="text-sm text-[#888]">
                  {product.currency} {Number(product.base_price).toFixed(2)}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {products.length === 0 && (
        <p className="text-center text-[#aaa] py-20 tracking-widest text-sm uppercase">
          No products available
        </p>
      )}
    </main>
  )
}
