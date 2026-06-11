import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import OrderForm from './order-form'

export default async function OrderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const profile = await getProfile()

  if (!profile) redirect(`/${locale}/login`)

  const isKo = locale === 'ko'

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: '#C5A059' }}>
          {isKo ? '발주' : 'Purchase Order'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-montserrat)', color: '#0F172A' }}>
          {isKo ? '발주하기' : 'Place an Order'}
        </h1>
        <p className="text-sm text-[#76777d] mt-3 leading-relaxed">
          {isKo
            ? '가격표(엑셀)에 주문 수량을 기입한 발주서 파일을 첨부해 제출해 주세요. 담당자가 확인 후 견적을 안내드립니다.'
            : 'Fill in your order quantities on the price list (Excel) and attach the order sheet. Our team will review and confirm your quotation.'}
        </p>
      </div>

      <OrderForm locale={locale} isKo={isKo} customerId={profile.id} />
    </main>
  )
}
