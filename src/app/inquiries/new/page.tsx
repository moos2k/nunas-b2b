'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function NewInquiryPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('inquiries')
      .insert({ customer_id: user.id, title, content })
      .select()
      .single()

    if (error || !data) {
      setError('Failed to submit inquiry.')
      setLoading(false)
      return
    }

    router.push(`/inquiries/${data.id}`)
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/inquiries" className="text-[10px] tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors mb-12 block">
        ← Inquiries
      </Link>

      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#888] mb-3">Support</p>
        <h1 className="text-4xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
          New Inquiry
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#888] mb-3">
            Subject
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border-b border-[#e8e4de] bg-transparent py-2 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#888] mb-3">
            Message
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            className="w-full border-b border-[#e8e4de] bg-transparent py-2 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-[#1a1a1a] text-[#1a1a1a] py-3 text-[10px] tracking-[0.3em] uppercase hover:bg-[#1a1a1a] hover:text-[#FAF9F7] transition-all duration-300 disabled:opacity-40"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </main>
  )
}
