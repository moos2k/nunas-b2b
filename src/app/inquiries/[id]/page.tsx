import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ReplyForm from './reply-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (!inquiry) notFound()

  const { data: replies } = await supabase
    .from('inquiry_replies')
    .select('*, profiles(full_name, role)')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/inquiries" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← Back to Inquiries
      </Link>

      {/* 문의 내용 */}
      <div className="border rounded-lg p-6 mb-6">
        <h1 className="text-xl font-bold mb-2">{inquiry.title}</h1>
        <p className="text-xs text-gray-400 mb-4">
          {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
        </p>
        <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
      </div>

      {/* 답변 목록 */}
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

      {/* 추가 답변 폼 */}
      <ReplyForm inquiryId={id} authorId={user.id} />
    </main>
  )
}
