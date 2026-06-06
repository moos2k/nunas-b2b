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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ customer_id: user.id, note: note || null })
      .select()
      .single()

    if (orderError || !order) {
      setError('Failed to create order. Please try again.')
      setLoading(false)
      return
    }

    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
      currency,
    })

    if (itemError) {
      setError('Failed to add item. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/orders/${order.id}`)
  }

  return (
    <div className="space-y-5">
      {/* 수량 */}
      <div>
        <label className="block text-[10px] tracking-[0.2em] uppercase text-[#888] mb-2">
          Quantity
        </label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-24 border-b border-[#1a1a1a] bg-transparent px-0 py-2 text-sm focus:outline-none text-center"
        />
      </div>

      {/* 소계 */}
      <p className="text-xs text-[#888] tracking-widest uppercase">
        Subtotal: {currency} {(unitPrice * quantity).toFixed(2)}
      </p>

      {/* 메모 */}
      <div>
        <label className="block text-[10px] tracking-[0.2em] uppercase text-[#888] mb-2">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Special requests or remarks"
          rows={2}
          className="w-full border-b border-[#e8e4de] bg-transparent px-0 py-2 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none placeholder:text-[#ccc]"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* 버튼 */}
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full border border-[#1a1a1a] text-[#1a1a1a] py-3 text-xs tracking-[0.3em] uppercase hover:bg-[#1a1a1a] hover:text-[#FAF9F7] transition-all duration-300 disabled:opacity-40"
      >
        {loading ? 'Processing...' : 'Submit Order'}
      </button>
    </div>
  )
}
