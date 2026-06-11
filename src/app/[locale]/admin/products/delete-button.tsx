'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function DeleteProductButton({ productId, name }: { productId: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`"${name}" 브랜드를 삭제하시겠습니까?\n연결된 가격표 파일과 이미지도 함께 삭제됩니다.`)) return
    setLoading(true)
    const supabase = createClient()

    // 1. 연결 이미지 레코드 삭제
    await supabase.from('product_images').delete().eq('product_id', productId)

    // 2. 상품 삭제 (주문에 사용된 경우 FK 제약으로 실패함)
    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) {
      setLoading(false)
      alert(
        '삭제할 수 없습니다.\n이미 주문 내역에 사용된 브랜드입니다.\n' +
        '주문 기록 보존을 위해 삭제 대신 "수정 → 활성화 해제"로 숨겨주세요.'
      )
      router.refresh()
      return
    }

    // 3. Storage 파일 정리 (실패해도 무방 — 고아 파일일 뿐)
    try {
      const buckets = ['price-lists', 'product-image'] as const
      for (const bucket of buckets) {
        const { data: files } = await supabase.storage.from(bucket).list(productId)
        if (files && files.length > 0) {
          await supabase.storage.from(bucket).remove(files.map((f) => `${productId}/${f.name}`))
        }
      }
    } catch { /* 무시 */ }

    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="text-red-400 hover:text-red-600 hover:underline disabled:opacity-40">
      {loading ? '삭제 중...' : '삭제'}
    </button>
  )
}
