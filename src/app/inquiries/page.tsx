import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  open:     '🔵 답변 대기',
  answered: '✅ 답변 완료',
  closed:   '⬜ 종료',
}

export default async function InquiriesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Inquiries</h1>
        <Link
          href="/inquiries/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          + New Inquiry
        </Link>
      </div>

      <div className="space-y-3">
        {inquiries?.map((inq) => (
          <Link
            key={inq.id}
            href={`/inquiries/${inq.id}`}
            className="block border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h2 className="font-semibold">{inq.title}</h2>
              <span className="text-xs ml-4 shrink-0">{STATUS_LABEL[inq.status]}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(inq.created_at).toLocaleDateString('ko-KR')}
            </p>
          </Link>
        ))}
        {(!inquiries || inquiries.length === 0) && (
          <p className="text-center text-gray-400 py-10">문의 내역이 없습니다.</p>
        )}
      </div>
    </main>
  )
}
