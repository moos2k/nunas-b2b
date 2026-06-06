import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  open:     'Open',
  answered: 'Answered',
  closed:   'Closed',
}

export default async function InquiriesPage() {
  const supabase = await createClient()

  const [profile, { data: inquiries }] = await Promise.all([
    getProfile(),
    supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect('/login')

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] mb-3">Support</p>
          <h1 className="text-4xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Inquiries
          </h1>
        </div>
        <Link
          href="/inquiries/new"
          className="border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 text-[10px] tracking-[0.2em] uppercase hover:bg-[#1a1a1a] hover:text-[#FAF9F7] transition-all duration-300"
        >
          New Inquiry
        </Link>
      </div>

      <div className="divide-y divide-[#e8e4de]">
        {inquiries?.map((inq) => (
          <Link key={inq.id} href={`/inquiries/${inq.id}`} className="flex justify-between items-center py-6 group">
            <div>
              <p className="text-sm font-light text-[#1a1a1a] group-hover:opacity-60 transition-opacity">
                {inq.title}
              </p>
              <p className="text-[10px] text-[#aaa] mt-1">
                {new Date(inq.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#888] shrink-0 ml-4">
              {STATUS_LABEL[inq.status]}
            </p>
          </Link>
        ))}
        {(!inquiries || inquiries.length === 0) && (
          <p className="text-center text-[#aaa] py-20 tracking-widest text-xs uppercase">
            No inquiries yet
          </p>
        )}
      </div>
    </main>
  )
}
