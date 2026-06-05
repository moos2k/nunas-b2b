import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import AdminReplyForm from './admin-reply-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminInquiryDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/products')

  const { data: inquiry } = await supabase
    .from('inquiries').select('*').eq('id', id).single()
  if (!inquiry) notFound()

  const { data: customer } = await supabase
    .from('profiles').select('full_name, company').eq('id', inquiry.customer_id).single()

  const { data: replies } = await supabase
    .from('inquiry_replies')
    .select('*, profiles(full_name, role)')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/admin/inquiries" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← 문의 목록
      </Link>

      {/* 고객 정보 */}
      <p className="text-xs text-gray-400 mb-2">
        {customer?.company ?? customer?.full_name ?? '-'}
      </p>

      {/* 문의 내용 */}
      <div className="border rounded-lg p-6 mb-6">
        <h1 className="text-xl font-bold mb-2">{inquiry.title}</h1>
        <p className="text-xs text-gray-400 mb-4">
          {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
        </p>
        <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
      </div>

      {/* 답변 스레드 */}
      {replies && replies.length > 0 && (
        <div className="space-y-4 mb-6">
          {replies.map((reply) => {
            const isAdmin = (reply.profiles as any)?.role === 'admin'
            return (
              <div
                key={reply.id}
                className={`rounded-lg p-5 ${isAdmin ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">
                    {isAdmin ? '🏢 담당자' : (reply.profiles as any)?.full_name ?? '고객'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(reply.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* 관리자 답변 폼 */}
      <AdminReplyForm inquiryId={id} authorId={user.id} currentStatus={inquiry.status} />
    </main>
  )
}
