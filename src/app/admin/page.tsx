import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const profile = await getProfile()

  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/products')

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">관리자 대시보드</h1>
      <p className="text-gray-500 mb-10">안녕하세요, {profile.full_name}님</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/admin/products" className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">상품 관리</h2>
          <p className="text-sm text-gray-500">상품 등록, 수정, 삭제</p>
        </Link>
        <Link href="/admin/orders" className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">주문 관리</h2>
          <p className="text-sm text-gray-500">발주서 확인 및 상태 변경</p>
        </Link>
        <Link href="/admin/inquiries" className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">문의 관리</h2>
          <p className="text-sm text-gray-500">고객 문의 확인 및 답변</p>
        </Link>
      </div>
    </main>
  )
}
