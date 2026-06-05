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
      setError('문의 등록 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    router.push(`/inquiries/${data.id}`)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/inquiries" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← Back to Inquiries
      </Link>
      <h1 className="text-2xl font-bold mb-8">New Inquiry</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? '제출 중...' : 'Submit'}
        </button>
      </form>
    </main>
  )
}
