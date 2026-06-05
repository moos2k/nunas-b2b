import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import StatusChanger from './status-changer'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [profile, { data: order }] = await Promise.all([
    getProfile(),
    supabase.from('orders').select('*, order_items(*, products(name, sku))').eq('id', id).single(),
  ])

  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/products')
  if (!order) notFound()

  const { data: customer } = await supabase
    .from('profiles').select('full_name, company, country').eq('id', order.customer_id).single()

  const total = order.order_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
  const currency = order.order_items[0]?.currency ?? 'USD'

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/admin/orders" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← Back to Orders
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">Order Detail</h1>
          <p className="text-xs text-gray-400 mt-1">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <StatusChanger orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="border rounded-lg p-5 mb-6 bg-white">
        <h2 className="font-semibold mb-3 text-gray-700">Customer</h2>
        <div className="text-sm space-y-1 text-gray-600">
          <p>Name: {customer?.full_name ?? '-'}</p>
          <p>Company: {customer?.company ?? '-'}</p>
          <p>Country: {customer?.country ?? '-'}</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden mb-6 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Qty</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Unit Price</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.order_items.map((item: any) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{item.products?.name}</p>
                  {item.products?.sku && <p className="text-xs text-gray-400">{item.products.sku}</p>}
                </td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{item.currency} {Number(item.unit_price).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium">{item.currency} {(item.unit_price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50">
              <td colSpan={3} className="px-4 py-3 font-bold text-right">Total</td>
              <td className="px-4 py-3 font-bold text-right">{currency} {total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {order.note && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium mb-1">Note</p>
          <p>{order.note}</p>
        </div>
      )}
    </main>
  )
}
