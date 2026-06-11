'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Brand {
  id: string
  name: string
  description: string | null
  sku: string | null
  order_schedule: string | null
  delivery_info: string | null
  price_list_url: string | null
  website_url: string | null
  product_images: { id: string; url: string }[]
  price_lists: { id: string; url: string; filename: string | null }[]
}

// 파일 1개면 바로 다운로드, 여러 개면 ZIP으로 묶어서 한 번에 다운로드
async function downloadAll(brand: Brand) {
  if (brand.price_lists.length === 1) {
    const pl = brand.price_lists[0]
    const a = document.createElement('a')
    a.href = `${pl.url}?download=${encodeURIComponent(pl.filename ?? `${brand.name}.xlsx`)}`
    a.click()
    return
  }

  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  await Promise.all(
    brand.price_lists.map(async (pl, i) => {
      const res = await fetch(pl.url)
      const blob = await res.blob()
      zip.file(pl.filename ?? `${brand.name}-${i + 1}.xlsx`, blob)
    })
  )

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${brand.name}.zip`
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  brands: Brand[]
  locale: string
  isKo: boolean
}

export default function BrandsClient({ brands, locale, isKo }: Props) {
  const [query, setQuery] = useState('')
  const [zippingId, setZippingId] = useState<string | null>(null)

  const handleDownload = async (brand: Brand) => {
    if (zippingId) return
    setZippingId(brand.id)
    try {
      await downloadAll(brand)
    } finally {
      setZippingId(null)
    }
  }

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase()) ||
    (b.description ?? '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      {/* 검색창 */}
      <div className="relative mb-10">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#76777d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isKo ? '브랜드 검색...' : 'Search brands...'}
          className="w-full max-w-md border border-[#c6c6cd] bg-white rounded pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-b-2 focus:border-b-[#0F172A] transition-colors"
        />
      </div>

      {/* 브랜드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((brand) => {
          const logo = brand.product_images?.[0]
          return (
            <div key={brand.id} className="bg-white border border-[#E2E8F0] rounded p-6 flex flex-col gap-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow relative">

              {/* 카드 전체 클릭 → 상세페이지 */}
              <Link href={`/${locale}/products/${brand.id}`} className="absolute inset-0 rounded" aria-label={brand.name} />

              {/* 로고 + 브랜드명 */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded bg-[#F8F9FA] flex items-center justify-center overflow-hidden shrink-0 border border-[#E2E8F0]">
                  {logo ? (
                    <Image src={logo.url} alt={brand.name} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <svg className="w-6 h-6 text-[#c6c6cd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-montserrat)', color: '#0F172A' }}>{brand.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {brand.sku && <p className="text-xs text-[#76777d]">{brand.sku}</p>}
                    {brand.website_url && (
                      <a href={brand.website_url} target="_blank" rel="noopener noreferrer"
                        className="relative z-10 inline-flex items-center gap-1 text-xs text-[#76777d] hover:text-[#0F172A] transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {isKo ? '공식 사이트' : 'Official Site'}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* 브랜드 설명 */}
              {brand.description && (
                <p className="text-sm text-[#45464d] leading-relaxed line-clamp-2">{brand.description}</p>
              )}

              {/* 주문/배송 정보 */}
              {(brand.order_schedule || brand.delivery_info) && (
                <p className="text-sm text-[#76777d]">
                  {brand.order_schedule && <>Order : {brand.order_schedule}</>}
                  {brand.order_schedule && brand.delivery_info && <span className="mx-1 text-[#c6c6cd]">///</span>}
                  {brand.delivery_info && <>delivery : {brand.delivery_info}</>}
                </p>
              )}

              {/* 가격표 다운로드 버튼 (파일 개수 표시, 전체 다운로드) */}
              {brand.price_lists?.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleDownload(brand)}
                  disabled={zippingId === brand.id}
                  className="relative z-10 mt-auto flex items-center justify-center gap-2 w-full text-white text-sm py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#0F172A' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  {zippingId === brand.id
                    ? (isKo ? '파일 준비 중...' : 'Preparing...')
                    : (isKo ? '가격표 다운로드' : 'Download Price Lists')}
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {brand.price_lists.length}
                  </span>
                </button>
              ) : (
                <div className="mt-auto flex items-center justify-center gap-2 w-full bg-[#F8F9FA] text-[#c6c6cd] text-sm py-2.5 rounded cursor-not-allowed">
                  {isKo ? '가격표 준비 중' : 'Price List Coming Soon'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[#76777d] py-20 text-sm">
          {query
            ? (isKo ? `"${query}"에 대한 결과가 없습니다.` : `No results for "${query}".`)
            : (isKo ? '등록된 브랜드가 없습니다.' : 'No brands available yet.')}
        </p>
      )}
    </>
  )
}
