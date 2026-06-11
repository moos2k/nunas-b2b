import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignupActionsClient from './signup-actions-client'

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABEL: Record<string, string> = {
  pending: '대기', approved: '승인됨', rejected: '거절됨',
}

export default async function AdminSignupsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const [profile, { data: requests }] = await Promise.all([
    getProfile(),
    supabase.from('signup_requests').select('*').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (profile.role !== 'admin') redirect(`/${locale}/products`)

  const pending = requests?.filter((r) => r.status === 'pending').length ?? 0

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href={`/${locale}/admin`} className="text-sm text-gray-400 hover:underline">← 대시보드</Link>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-2xl font-bold">가입 신청</h1>
          {pending > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
              대기 {pending}건
            </span>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">신청자</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">회사명</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">국가</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">사업자번호</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">연락처</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">신청일</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests?.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{req.full_name}</p>
                  <p className="text-xs text-gray-400">{req.email}</p>
                </td>
                <td className="px-4 py-3">{req.company}</td>
                <td className="px-4 py-3">{req.country}</td>
                <td className="px-4 py-3 text-gray-500">{req.business_number ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500">{req.phone ?? '-'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(req.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 border rounded-full ${STATUS_STYLE[req.status]}`}>
                    {STATUS_LABEL[req.status] ?? req.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <SignupActionsClient
                    requestId={req.id}
                    email={req.email}
                    status={req.status}
                  />
                </td>
              </tr>
            ))}
            {(!requests || requests.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">가입 신청 내역이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
