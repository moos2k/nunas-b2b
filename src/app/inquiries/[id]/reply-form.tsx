'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Props {
  inquiryId: string
  authorId: string
}

export default function ReplyForm({ inquiryId, authorId }: Props) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('inquiry_replies').insert({ inquiry_id: inquiryId, author_id: authorId, content })
    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-t border-[#e8e4de] pt-8">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={3}
        placeholder="Add a message..."
        className="w-full border-b border-[#e8e4de] bg-transparent py-2 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none placeholder:text-[#ccc]"
      />
      <button
        type="submit"
        disabled={loading}
        className="border border-[#1a1a1a] text-[#1a1a1a] px-8 py-2.5 text-[10px] tracking-[0.2em] uppercase hover:bg-[#1a1a1a] hover:text-[#FAF9F7] transition-all duration-300 disabled:opacity-40"
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}
