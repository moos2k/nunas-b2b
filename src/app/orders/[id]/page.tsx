import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

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

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`*, order_items(*, products(name, sku))`)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const total = order.order_items.reduce(
    (sum: number, item: any) => sum + item.unit_price * item.quantity, 0
  )
  const currency = order.order_items[0]?.currency ?? 'USD'

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/products" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← Back to Products
      </Link>

      <div className="border rounded-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order Confirmation</h1>
            <p className="text-xs text-gray-400 mt-1">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {/* 주문 항목 */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-gray-600">상품</th>
              <th className="text-right py-2 font-medium text-gray-600">수량</th>
              <th className="text-right py-2 font-medium text-gray-600">단가</th>
              <th className="text-right py-2 font-medium text-gray-600">소계</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.order_items.map((item: any) => (
              <tr key={item.id}>
                <td className="py-3">
                  <p className="font-medium">{item.products?.name}</p>
                  {item.products?.sku && (
                    <p className="text-xs text-gray-400">{item.products.sku}</p>
                  )}
                </td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{item.currency} {Number(item.unit_price).toFixed(2)}</td>
                <td className="py-3 text-right font-medium">
                  {item.currency} {(item.unit_price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t">
              <td colSpan={3} className="pt-3 font-bold text-right">Total</td>
              <td className="pt-3 font-bold text-right">{currency} {total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {order.note && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-6">
            <p className="font-medium mb-1">메모</p>
            <p>{order.note}</p>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">📬 다음 단계</p>
          <p>주문이 접수되었습니다. 담당자가 확인 후 견적을 안내드리겠습니다.</p>
        </div>
      </div>
    </main>
  )
}
