import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  submitted:  '📋 Submitted',
  confirmed:  '✅ Confirmed',
  invoiced:   '🧾 Invoiced',
  paid:       '💰 Payment Received',
  shipped:    '🚚 Shipped',
  completed:  '🎉 Completed',
  cancelled:  '❌ Cancelled',
}

export default async function MyOrdersPage() {
  const supabase = await createClient()

  const [profile, { data: orders }] = await Promise.all([
    getProfile(),
    supabase.from('orders').select('*, order_items(quantity, unit_price, currency)').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect('/login')

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      <div className="space-y-3">
        {orders?.map((order) => {
          const total = order.order_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
          const currency = order.order_items[0]?.currency ?? 'USD'
          return (
            <Link key={order.id} href={`/orders/${order.id}`} className="block border rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-xs text-gray-400 mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="font-semibold">{currency} {total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{STATUS_LABEL[order.status]}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString('en-US')}</p>
                </div>
              </div>
            </Link>
          )
        })}
        {(!orders || orders.length === 0) && (
          <p className="text-center text-gray-400 py-10">No orders yet.</p>
        )}
      </div>
    </main>
  )
}
