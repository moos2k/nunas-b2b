import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()

  // 로그인 여부 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 관리자 역할 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/products')

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">관리자 대시보드</h1>
      <p className="text-gray-500 mb-10">안녕하세요, {profile.full_name}님</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <a
          href="/admin/products"
          className="border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-1">상품 관리</h2>
          <p className="text-sm text-gray-500">상품 등록, 수정, 삭제</p>
        </a>

        <a
          href="/admin/orders"
          className="border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-1">주문 관리</h2>
          <p className="text-sm text-gray-500">발주서 확인 및 상태 변경</p>
        </a>

        <a
          href="/admin/inquiries"
          className="border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-1">문의 관리</h2>
          <p className="text-sm text-gray-500">고객 문의 확인 및 답변</p>
        </a>
      </div>
    </main>
  )
}
