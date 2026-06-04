'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Props {
  productId: string
  productName: string
  unitPrice: number
  currency: string
}

export default function OrderButton({ productId, productName, unitPrice, currency }: Props) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOrder = async () => {
    setError('')
    setLoading(true)

    const supabase = createClient()

    // 로그인 여부 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 발주서 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ customer_id: user.id, note: note || null })
      .select()
      .single()

    if (orderError || !order) {
      setError('발주서 생성 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    // 발주 항목 추가
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        currency,
      })

    if (itemError) {
      setError('발주 항목 저장 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    router.push(`/orders/${order.id}`)
  }

  return (
    <div className="mt-8 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          수량
        </label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모 (선택)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="특이사항, 요청사항 등"
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="text-sm text-gray-500">
        소계: {currency} {(unitPrice * quantity).toFixed(2)}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? '처리 중...' : 'Submit Order'}
      </button>
    </div>
  )
}
