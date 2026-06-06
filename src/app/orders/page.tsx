import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] mb-3">Account</p>
        <h1 className="text-4xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
          My Orders
        </h1>
      </div>

      <div className="divide-y divide-[#e8e4de]">
        {orders?.map((order) => {
          const total = order.order_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
          const currency = order.order_items[0]?.currency ?? 'USD'
          return (
            <Link key={order.id} href={`/orders/${order.id}`} className="flex justify-between items-center py-6 group">
              <div>
                <p className="font-mono text-[10px] text-[#aaa] tracking-widest mb-1">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm font-light text-[#1a1a1a] group-hover:opacity-60 transition-opacity">
                  {currency} {total.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#888]">
                  {STATUS_LABEL[order.status]}
                </p>
                <p className="text-[10px] text-[#aaa] mt-1">
                  {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </Link>
          )
        })}
        {(!orders || orders.length === 0) && (
          <p className="text-center text-[#aaa] py-20 tracking-widest text-xs uppercase">
            No orders yet
          </p>
        )}
      </div>
    </main>
  )
}
