'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveSignup, rejectSignup } from './actions'

interface Props {
  requestId: string
  email: string
  status: string // pending | approved | rejected
}

export default function SignupActionsClient({ requestId, email, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!confirm(`${email} 님의 가입을 승인하시겠습니까?`)) return
    setLoading(true)
    const res = await approveSignup(requestId, email)
    setLoading(false)
    if (res.error) {
      alert('오류: ' + res.error)
      return
    }
    router.refresh()
  }

  const handleReject = async () => {
    if (!confirm(`${email} 님의 가입을 거절하시겠습니까?\n(이미 승인된 경우 즉시 로그인이 차단됩니다)`)) return
    setLoading(true)
    const res = await rejectSignup(requestId, email)
    setLoading(false)
    if (res.error) {
      alert('오류: ' + res.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      {status !== 'approved' && (
        <button onClick={handleApprove} disabled={loading}
          className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-40">
          {loading ? '처리 중...' : '승인'}
        </button>
      )}
      {status !== 'rejected' && (
        <button onClick={handleReject} disabled={loading}
          className="text-xs border border-red-300 text-red-500 px-3 py-1 rounded hover:bg-red-50 disabled:opacity-40">
          {loading ? '처리 중...' : '거절'}
        </button>
      )}
    </div>
  )
}
