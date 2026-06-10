import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  submitted: '📋 접수됨', confirmed: '✅ 확인됨', invoiced: '🧾 인보이스 발행',
  paid: '💰 입금 확인', shipped: '🚚 배송 중', completed: '🎉 완료', cancelled: '❌ 취소됨',
}

export default async function AdminOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const [profile, { data: orders }] = await Promise.all([
    getProfile(),
    supabase.from('orders').select('*, order_items(quantity, unit_price, currency)').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (profile.role !== 'admin') redirect(`/${locale}/products`)

  const customerIds = [...new Set(orders?.map((o) => o.customer_id) ?? [])]
  const { data: profilesList } = customerIds.length
    ? await supabase.from('profiles').select('id, full_name, company').in('id', customerIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profilesList ?? []).map((p) => [p.id, p]))

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href={`/${locale}/admin`} className="text-sm text-gray-400 hover:underline">← 대시보드</Link>
        <h1 className="text-2xl font-bold mt-1">주문 관리</h1>
      </div>
      <div className="border rounded-lg overflow-hidden bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">주문번호</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">고객</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">금액</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">주문일</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders?.map((order) => {
              const total = order.order_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
              const currency = order.order_items[0]?.currency ?? 'USD'
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">{profileMap[order.customer_id]?.company ?? profileMap[order.customer_id]?.full_name ?? '-'}</td>
                  <td className="px-4 py-3">{STATUS_LABEL[order.status]}</td>
                  <td className="px-4 py-3 text-right">{currency} {total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/${locale}/admin/orders/${order.id}`} className="text-blue-500 hover:underline">보기</Link>
                  </td>
                </tr>
              )
            })}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">주문 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
