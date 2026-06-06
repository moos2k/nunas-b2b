import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect, notFound } from 'next/navigation'
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

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [profile, { data: order }] = await Promise.all([
    getProfile(),
    supabase.from('orders').select('*, order_items(*, products(name, sku))').eq('id', id).single(),
  ])

  if (!profile) redirect('/login')
  if (!order) notFound()

  const total = order.order_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
  const currency = order.order_items[0]?.currency ?? 'USD'

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/orders" className="text-[10px] tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors mb-12 block">
        ← Orders
      </Link>

      <div className="mb-10">
        <p className="font-mono text-[10px] text-[#aaa] tracking-widest mb-2">
          #{order.id.slice(0, 8).toUpperCase()}
        </p>
        <h1 className="text-4xl font-light mb-3" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Order Confirmation
        </h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#888]">
          {STATUS_LABEL[order.status]}
        </p>
      </div>

      {/* 주문 항목 */}
      <div className="divide-y divide-[#e8e4de] mb-10">
        {order.order_items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-start py-5">
            <div>
              <p className="text-sm font-light text-[#1a1a1a]">{item.products?.name}</p>
              {item.products?.sku && (
                <p className="text-[10px] tracking-widest text-[#aaa] mt-1">SKU: {item.products.sku}</p>
              )}
              <p className="text-xs text-[#888] mt-1">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#1a1a1a]">{item.currency} {(item.unit_price * item.quantity).toFixed(2)}</p>
              <p className="text-[10px] text-[#aaa] mt-1">{item.currency} {Number(item.unit_price).toFixed(2)} / unit</p>
            </div>
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div className="flex justify-between items-center border-t border-[#1a1a1a] pt-5 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-[#888]">Total</p>
        <p className="text-lg font-light">{currency} {total.toFixed(2)}</p>
      </div>

      {order.note && (
        <div className="border-t border-[#e8e4de] pt-6 mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#888] mb-2">Note</p>
          <p className="text-sm text-[#666] font-light">{order.note}</p>
        </div>
      )}

      <div className="bg-[#F0EDE8] p-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#888] mb-2">Next Steps</p>
        <p className="text-sm text-[#666] font-light leading-relaxed">
          Your order has been received. Our team will review it and get back to you with a quotation shortly.
        </p>
      </div>
    </main>
  )
}
