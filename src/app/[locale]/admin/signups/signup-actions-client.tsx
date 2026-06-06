'use client'

import { useState } from 'react'
import { approveSignup, rejectSignup } from './actions'

interface Props {
  requestId: string
  email: string
  fullName: string
  company: string
  country: string
}

export default function SignupActionsClient({ requestId, email, fullName, company, country }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ tempPassword?: string; rejected?: boolean } | null>(null)

  const handleApprove = async () => {
    if (!confirm(`Approve ${email}?`)) return
    setLoading(true)
    const res = await approveSignup(requestId, email, fullName, company, country)
    setLoading(false)
    if (res.error) {
      alert('Error: ' + res.error)
    } else {
      setResult({ tempPassword: res.tempPassword })
    }
  }

  const handleReject = async () => {
    if (!confirm(`Reject ${email}?`)) return
    setLoading(true)
    await rejectSignup(requestId)
    setLoading(false)
    setResult({ rejected: true })
  }

  if (result?.rejected) {
    return <span className="text-xs text-red-500">Rejected</span>
  }

  if (result?.tempPassword) {
    return (
      <div className="text-xs bg-green-50 border border-green-200 rounded p-2 max-w-xs">
        <p className="font-medium text-green-700 mb-1">✅ Approved</p>
        <p className="text-green-600">Temp password:</p>
        <p className="font-mono font-bold text-green-800">{result.tempPassword}</p>
        <p className="text-green-500 mt-1">Share with the buyer securely.</p>
      </div>
    )
  }

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
