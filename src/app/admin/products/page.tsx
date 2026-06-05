import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const [profile, { data: products }] = await Promise.all([
    getProfile(),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/products')

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
          + Add Product
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Active</th>
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
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-blue-500 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
