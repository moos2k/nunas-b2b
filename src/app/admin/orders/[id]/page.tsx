import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import StatusChanger from './status-changer'

const STATUS_LABEL: Record<string, string> = {
  submitted:  '📋 접수됨',
  confirmed:  '✅ 확인됨',
  invoiced:   '🧾 인보이스 발행',
  paid:       '💰 입금 확인',
  shipped:    '🚚 배송 중',
  completed:  '🎉 완료',
  cancelled:  '❌ 취소됨',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/products')

  const { data: order } = await supabase
    .from('orders')
    .select(`*, order_items(*, products(name, sku))`)
    .eq('id', id)
    .single()

  if (!order) notFound()

  // 고객 정보 별도 조회
  const { data: customer } = await supabase
    .from('profiles')
    .select('full_name, company, country')
    .eq('id', order.customer_id)
    .single()

  const total = order.order_items.reduce(
    (sum: number, item: any) => sum + item.unit_price * item.quantity, 0
  )
  const currency = order.order_items[0]?.currency ?? 'USD'

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/admin/orders" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← 주문 목록
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">주문 상세</h1>
          <p className="text-xs text-gray-400 mt-1">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <StatusChanger orderId={order.id} currentStatus={order.status} />
      </div>

      {/* 고객 정보 */}
      <div className="border rounded-lg p-5 mb-6">
        <h2 className="font-semibold mb-3 text-gray-700">고객 정보</h2>
        <div className="text-sm space-y-1 text-gray-600">
          <p>이름: {customer?.full_name ?? '-'}</p>
          <p>회사: {customer?.company ?? '-'}</p>
          <p>국가: {customer?.country ?? '-'}</p>
        </div>
      </div>

      {/* 주문 항목 */}
      <div className="border rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">상품</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">수량</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">단가</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">소계</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.order_items.map((item: any) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{item.products?.name}</p>
                  {item.products?.sku && (
                    <p className="text-xs text-gray-400">{item.products.sku}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{item.currency} {Number(item.unit_price).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {item.currency} {(item.unit_price * item.quantity).toFixed(2)}
                </td>
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
          <p className="font-medium mb-1">메모</p>
          <p>{order.note}</p>
        </div>
      )}
    </main>
  )
}
