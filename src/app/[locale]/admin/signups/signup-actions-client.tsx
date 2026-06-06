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
    if (!confirm(`Approve ${email}?`)) return
    setLoading(true)
    const res = await approveSignup(requestId, email)
    setLoading(false)
    if (res.error) {
      alert('Error: ' + res.error)
    } else {
      setResult('approved')
    }
  }

  const handleReject = async () => {
    if (!confirm(`Reject ${email}?`)) return
    setLoading(true)
    await rejectSignup(requestId, email)
    setLoading(false)
    setResult('rejected')
  }

  if (result === 'approved') return <span className="text-xs text-green-600 font-medium">✅ Approved</span>
  if (result === 'rejected') return <span className="text-xs text-red-500">❌ Rejected</span>

  return (
    <div className="flex gap-2">
      <button onClick={handleApprove} disabled={loading}
        className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-40">
        Approve
      </button>
      <button onClick={handleReject} disabled={loading}
        className="text-xs border border-red-300 text-red-500 px-3 py-1 rounded hover:bg-red-50 disabled:opacity-40">
        Reject
      </button>
    </div>
  )
}
