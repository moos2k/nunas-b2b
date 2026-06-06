'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AdminReplyForm({ inquiryId, authorId, currentStatus }: { inquiryId: string; authorId: string; currentStatus: string }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('inquiry_replies').insert({ inquiry_id: inquiryId, author_id: authorId, content })
    await supabase.from('inquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', inquiryId)
    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-5 bg-white">
      <h2 className="font-semibold text-sm text-gray-700">Write a Reply</h2>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4}
        placeholder="Type your reply..."
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
      <div className="flex gap-3 items-center">
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
          <option value="open">🔵 Open</option>
          <option value="answered">✅ Answered</option>
          <option value="closed">⬜ Closed</option>
        </select>
        <button type="submit" disabled={loading}
          className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reply'}
        </button>
      </div>
    </form>
  )
}
