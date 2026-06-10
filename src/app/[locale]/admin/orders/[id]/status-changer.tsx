'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const STATUS_OPTIONS = [
  { value: 'submitted', label: '📋 접수됨' },
  { value: 'confirmed', label: '✅ 확인됨' },
  { value: 'invoiced',  label: '🧾 인보이스 발행' },
  { value: 'paid',      label: '💰 입금 확인' },
  { value: 'shipped',   label: '🚚 배송 중' },
  { value: 'completed', label: '🎉 완료' },
  { value: 'cancelled', label: '❌ 취소됨' },
]

export default function StatusChanger({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (newStatus: string) => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
    setStatus(newStatus)
    setLoading(false)
    router.refresh()
  }

  return (
    <select value={status} onChange={(e) => handleChange(e.target.value)} disabled={loading}
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50">
      {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  )
}
