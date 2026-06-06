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
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/inquiries" className="text-[10px] tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors mb-12 block">
        ← Inquiries
      </Link>

      {/* 문의 내용 */}
      <div className="mb-10">
        <h1 className="text-3xl font-light mb-3" style={{ fontFamily: 'var(--font-cormorant)' }}>
          {inquiry.title}
        </h1>
        <p className="text-[10px] text-[#aaa] tracking-widest mb-6">
          {new Date(inquiry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-sm text-[#666] font-light leading-relaxed whitespace-pre-wrap">
          {inquiry.content}
        </p>
      </div>

      {/* 답변 스레드 */}
      {replies && replies.length > 0 && (
        <div className="space-y-6 mb-10 border-t border-[#e8e4de] pt-8">
          {replies.map((reply) => {
            const isAdmin = (reply.profiles as any)?.role === 'admin'
            return (
              <div key={reply.id} className={`pl-4 ${isAdmin ? 'border-l-2 border-[#1a1a1a]' : 'border-l border-[#e8e4de]'}`}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#888]">
                    {isAdmin ? 'Support' : (reply.profiles as any)?.full_name ?? 'You'}
                  </p>
                  <p className="text-[10px] text-[#aaa]">
                    {new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <p className="text-sm text-[#444] font-light leading-relaxed whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <ReplyForm inquiryId={id} authorId={profile.id} />
    </main>
  )
}
