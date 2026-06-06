import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  submitted:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  invoiced:   'bg-purple-50 text-purple-700 border-purple-200',
  paid:       'bg-green-50 text-green-700 border-green-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed:  'bg-gray-50 text-gray-700 border-gray-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABEL: Record<string, string> = {
  submitted:  'Submitted',
  confirmed:  'Confirmed',
  invoiced:   'Invoiced',
  paid:       'Payment Received',
  shipped:    'Shipped',
  completed:  'Completed',
  cancelled:  'Cancelled',
}

export default async function MyOrdersPage() {
  const supabase = await createClient()

  const [profile, { data: orders }] = await Promise.all([
    getProfile(),
    supabase.from('orders').select('*, order_items(quantity, unit_price, currency)').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect('/login')

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8 border-b border-[#e8e4de] pb-6">
        <h1 className="text-4xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
          My Orders
        </h1>
      </div>

      <div className="space-y-3">
        {orders?.map((order) => {
          const total = order.order_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
          const currency = order.order_items[0]?.currency ?? 'USD'
          const itemCount = order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0)
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between bg-white border border-[#e8e4de] px-6 py-4 hover:border-[#1a1a1a] transition-colors group"
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-mono text-xs text-[#999]">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-[#444] mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-[#888]">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-3 py-1 border rounded-full ${STATUS_COLOR[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {STATUS_LABEL[order.status]}
                </span>
                <p className="text-base font-semibold text-[#1a1a1a] min-w-[100px] text-right">
                  {currency} {total.toFixed(2)}
                </p>
              </div>
            </Link>
          )
        })}
        {(!orders || orders.length === 0) && (
          <p className="text-center text-[#aaa] py-20 text-sm">No orders yet.</p>
        )}
      </div>
    </main>
  )
}
