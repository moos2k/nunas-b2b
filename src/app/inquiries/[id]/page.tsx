import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ReplyForm from './reply-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [profile, { data: inquiry }] = await Promise.all([
    getProfile(),
    supabase.from('inquiries').select('*').eq('id', id).single(),
  ])

  if (!profile) redirect('/login')
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

      <div className="border rounded-lg p-6 mb-6 bg-white">
        <h1 className="text-xl font-bold mb-2">{inquiry.title}</h1>
        <p className="text-xs text-gray-400 mb-4">{new Date(inquiry.created_at).toLocaleDateString('en-US')}</p>
        <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
      </div>

      {replies && replies.length > 0 && (
        <div className="space-y-4 mb-6">
          {replies.map((reply) => {
            const isAdmin = (reply.profiles as any)?.role === 'admin'
            return (
              <div key={reply.id} className={`rounded-lg p-5 ${isAdmin ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">
                    {isAdmin ? '🏢 Support' : (reply.profiles as any)?.full_name ?? 'You'}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleDateString('en-US')}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
              </div>
            )
          })}
        </div>
      )}

      <ReplyForm inquiryId={id} authorId={profile.id} />
    </main>
  )
}
