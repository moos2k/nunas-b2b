import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteProductButton from './delete-button'

export default async function AdminProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const [profile, { data: products }] = await Promise.all([
    getProfile(),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (profile.role !== 'admin') redirect(`/${locale}/products`)

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href={`/${locale}/admin`} className="text-sm text-gray-400 hover:underline">← 대시보드</Link>
          <h1 className="text-2xl font-bold mt-1">브랜드 · 상품</h1>
        </div>
        <Link href={`/${locale}/admin/products/new`} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
          + 브랜드 등록
        </Link>
      </div>
      <div className="border rounded-lg overflow-hidden bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">브랜드명</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">카테고리</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">코드(SKU)</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">기준가</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">활성</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-gray-500">{product.category ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500">{product.sku ?? '-'}</td>
                <td className="px-4 py-3 text-right">{product.currency} {Number(product.base_price).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">{product.is_active ? '✅' : '❌'}</td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link href={`/${locale}/admin/products/${product.id}/edit`} className="text-blue-500 hover:underline">수정</Link>
                  <DeleteProductButton productId={product.id} name={product.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
