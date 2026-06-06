'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useTranslations } from 'next-intl'

interface Props {
  productId: string
  productName: string
  unitPrice: number
  currency: string
  locale: string
}

export default function OrderButton({ productId, unitPrice, currency, locale }: Props) {
  const router = useRouter()
  const t = useTranslations('order')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOrder = async () => {
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }

    const { data: order, error: orderError } = await supabase
      .from('orders').insert({ customer_id: user.id, note: note || null }).select().single()

    if (orderError || !order) { setError(t('errorCreate')); setLoading(false); return }

    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id, product_id: productId, quantity, unit_price: unitPrice, currency,
    })

    if (itemError) { setError(t('errorItem')); setLoading(false); return }

    router.push(`/${locale}/orders/${order.id}`)
  }

  return (
    <div className="space-y-5 border-t border-[#e8e4de] pt-6">
      <div className="flex items-end gap-6">
        <div>
          <label className="block text-xs font-medium text-[#1a1a1a] mb-2 uppercase tracking-wide">{t('quantity')}</label>
          <input
            type="number" min={1} value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-24 border border-[#e8e4de] rounded px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#1a1a1a] transition-colors text-center"
          />
        </div>
        <div className="pb-2">
          <p className="text-xs text-[#888] uppercase tracking-wide mb-1">{t('subtotal')}</p>
          <p className="text-xl font-semibold text-[#1a1a1a]">{currency} {(unitPrice * quantity).toFixed(2)}</p>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#1a1a1a] mb-2 uppercase tracking-wide">{t('note')}</label>
        <textarea
          value={note} onChange={(e) => setNote(e.target.value)}
          placeholder={t('notePlaceholder')} rows={2}
          className="w-full border border-[#e8e4de] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none placeholder:text-[#ccc]"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleOrder} disabled={loading}
        className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm font-medium tracking-wider uppercase hover:bg-[#333] transition-colors disabled:opacity-40"
      >
        {loading ? t('processing') : t('submit')}
      </button>
    </div>
  )
}
