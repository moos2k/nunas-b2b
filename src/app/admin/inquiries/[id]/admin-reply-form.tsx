'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Props {
  inquiryId: string
  authorId: string
  currentStatus: string
}

export default function AdminReplyForm({ inquiryId, authorId, currentStatus }: Props) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    await supabase.from('inquiry_replies').insert({
      inquiry_id: inquiryId,
      author_id: authorId,
      content,
    })

    await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', inquiryId)

    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-5">
      <h2 className="font-semibold text-sm text-gray-700">답변 작성</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={4}
        placeholder="답변 내용을 입력하세요..."
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      <div className="flex gap-3 items-center">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="open">🔵 답변 대기</option>
          <option value="answered">✅ 답변 완료</option>
          <option value="closed">⬜ 종료</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? '전송 중...' : '답변 등록'}
        </button>
      </div>
    </form>
  )
}
