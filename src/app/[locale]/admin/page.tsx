import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const profile = await getProfile()

  if (!profile) redirect(`/${locale}/login`)
  if (profile.role !== 'admin') redirect(`/${locale}/products`)

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">관리자 대시보드</h1>
      <p className="text-gray-500 mb-10">{profile.full_name}님, 환영합니다</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href={`/${locale}/admin/products`} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">브랜드 · 상품</h2>
          <p className="text-sm text-gray-500">브랜드/상품 등록·수정·관리</p>
        </Link>
        <Link href={`/${locale}/admin/orders`} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">주문 관리</h2>
          <p className="text-sm text-gray-500">주문 확인 및 상태 변경</p>
        </Link>
        <Link href={`/${locale}/admin/inquiries`} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">문의 관리</h2>
          <p className="text-sm text-gray-500">고객 문의 답변</p>
        </Link>
        <Link href={`/${locale}/admin/signups`} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-lg font-semibold mb-1">가입 신청</h2>
          <p className="text-sm text-gray-500">신규 바이어 가입 신청 검토·승인</p>
        </Link>
      </div>
    </main>
  )
}
