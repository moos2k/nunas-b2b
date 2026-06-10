'use client'

import { useState } from 'react'
import { approveSignup, rejectSignup } from './actions'

interface Props {
  requestId: string
  email: string
}

export default function SignupActionsClient({ requestId, email }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null)

  const handleApprove = async () => {
    if (!confirm(`${email} 님의 가입을 승인하시겠습니까?`)) return
    setLoading(true)
    const res = await approveSignup(requestId, email)
    setLoading(false)
    if (res.error) {
      alert('오류: ' + res.error)
    } else {
      setResult('approved')
    }
  }

  const handleReject = async () => {
    if (!confirm(`${email} 님의 가입을 거절하시겠습니까?`)) return
    setLoading(true)
    await rejectSignup(requestId, email)
    setLoading(false)
    setResult('rejected')
  }

  if (result === 'approved') return <span className="text-xs text-green-600 font-medium">✅ 승인됨</span>
  if (result === 'rejected') return <span className="text-xs text-red-500">❌ 거절됨</span>

  return (
    <div className="flex gap-2">
      <button onClick={handleApprove} disabled={loading}
        className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-40">
        승인
      </button>
      <button onClick={handleReject} disabled={loading}
        className="text-xs border border-red-300 text-red-500 px-3 py-1 rounded hover:bg-red-50 disabled:opacity-40">
        거절
      </button>
    </div>
  )
}
