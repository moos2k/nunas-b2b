import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const profile = await getProfile()

  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/products')

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-10">Welcome, {profile.full_name}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/admin/products" className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">Products</h2>
          <p className="text-sm text-gray-500">Add, edit, and manage products</p>
        </Link>
        <Link href="/admin/orders" className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">Orders</h2>
          <p className="text-sm text-gray-500">Review and update order status</p>
        </Link>
        <Link href="/admin/inquiries" className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">Inquiries</h2>
          <p className="text-sm text-gray-500">Respond to customer inquiries</p>
        </Link>
      </div>
    </main>
  )
}
