import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect, notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import OrderFiles from '@/components/order-files'

interface Props { params: Promise<{ locale: string; id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()
  const t = await getTranslations('orders')

  const [profile, { data: order }, { data: orderFiles }] = await Promise.all([
    getProfile(),
    supabase.from('orders').select('*, order_items(*, products(name, sku))').eq('id', id).single(),
    supabase.from('order_files').select('*').eq('order_id', id).order('created_at'),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (!order) notFound()

  const company = profile.company || profile.full_name || 'order'

  const total = order.order_items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0)
  const currency = order.order_items[0]?.currency ?? 'USD'

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href={`/${locale}/orders`} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors mb-8 block">{t('back')}</Link>

      <div className="mb-10">
        <p className="font-mono text-[10px] text-[#aaa] tracking-widest mb-2">#{order.id.slice(0, 8).toUpperCase()}</p>
        <h1 className="text-4xl font-light mb-3" style={{ fontFamily: 'var(--font-cormorant)' }}>{t('orderConfirmation')}</h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#888]">{t(`status.${order.status}`)}</p>
      </div>

      {/* 첨부된 발주서 파일 */}
      {orderFiles && orderFiles.length > 0 && (
        <OrderFiles files={orderFiles} company={company} createdAt={order.created_at} isKo={locale === 'ko'} />
      )}

      <div className="divide-y divide-[#e8e4de] mb-10">
        {order.order_items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-start py-5">
            <div>
              <p className="text-sm font-light text-[#1a1a1a]">{item.products?.name}</p>
              {item.products?.sku && <p className="text-[10px] tracking-widest text-[#aaa] mt-1">SKU: {item.products.sku}</p>}
              <p className="text-xs text-[#888] mt-1">{t('qty')}: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#1a1a1a]">{item.currency} {(item.unit_price * item.quantity).toFixed(2)}</p>
              <p className="text-[10px] text-[#aaa] mt-1">{item.currency} {Number(item.unit_price).toFixed(2)} / {locale === 'ko' ? '개' : 'unit'}</p>
            </div>
          </div>
        ))}
      </div>

      {order.order_items.length > 0 && (
        <div className="flex justify-between items-center border-t border-[#1a1a1a] pt-5 mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-[#888]">{t('total')}</p>
          <p className="text-lg font-light">{currency} {total.toFixed(2)}</p>
        </div>
      )}

      {order.note && (
        <div className="border-t border-[#e8e4de] pt-6 mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#888] mb-2">{t('note')}</p>
          <p className="text-sm text-[#666] font-light">{order.note}</p>
        </div>
      )}

      <div className="bg-[#F0EDE8] p-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#888] mb-2">{t('nextSteps')}</p>
        <p className="text-sm text-[#666] font-light leading-relaxed">{t('nextStepsDesc')}</p>
      </div>
    </main>
  )
}
