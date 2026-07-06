'use client'

import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { fetchBrandLogo } from './actions'

interface Product {
  id: string
  name: string
  description: string | null
  category: string | null
  sku: string | null
  base_price: number
  currency: string
  is_active: boolean
  order_schedule: string | null
  delivery_info: string | null
  price_list_url: string | null
  website_url: string | null
}

interface BrandSuggestion {
  name: string
  domain: string
  logo: string
}

interface ProductImage {
  id: string
  url: string
  sort_order: number
}

interface PriceList {
  id: string
  url: string
  filename: string | null
}

interface Props {
  product?: Product
  images?: ProductImage[]
  priceLists?: PriceList[]
}

export default function ProductForm({ product, images = [], priceLists = [] }: Props) {
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    category: product?.category ?? '',
    sku: product?.sku ?? '',
    base_price: product?.base_price?.toString() ?? '0',
    currency: product?.currency ?? 'USD',
    is_active: product?.is_active ?? true,
    order_schedule: product?.order_schedule ?? '',
    delivery_info: product?.delivery_info ?? '',
    website_url: product?.website_url ?? '',
  })
  const [suggestions, setSuggestions] = useState<BrandSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [existingImages, setExistingImages] = useState<ProductImage[]>(images)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingPriceLists, setExistingPriceLists] = useState<PriceList[]>(priceLists)
  const [newPriceListFiles, setNewPriceListFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 브랜드 검색 (Clearbit 자동완성 — 입력 후 0.4초 디바운스)
  const handleBrandSearch = (query: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (query.trim().length < 2) { setSuggestions([]); return }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`)
        if (res.ok) setSuggestions(await res.json())
      } catch { setSuggestions([]) }
    }, 400)
  }

  // 추천 선택 → 이름/홈페이지 자동 입력 + 로고 자동 첨부
  const applySuggestion = async (s: BrandSuggestion) => {
    setSuggestions([])
    setSearching(true)
    setForm((prev) => ({
      ...prev,
      name: prev.name || s.name,
      website_url: `https://${s.domain}`,
    }))

    const result = await fetchBrandLogo(s.domain)
    if (result.base64) {
      const byteString = atob(result.base64)
      const bytes = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i)
      const ext = result.contentType?.includes('jpeg') ? 'jpg' : 'png'
      const file = new File([bytes], `logo.${ext}`, { type: result.contentType ?? 'image/png' })
      setNewFiles((prev) => [...prev, file])
      setPreviews((prev) => [...prev, URL.createObjectURL(file)])
    }
    setSearching(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setNewFiles((prev) => [...prev, ...files])
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // 기존 가격표 파일 삭제 (DB 레코드 + Storage 파일)
  const removeExistingPriceList = async (pl: PriceList) => {
    if (!confirm(`"${pl.filename ?? '가격표'}" 파일을 삭제하시겠습니까?`)) return
    const supabase = createClient()
    await supabase.from('price_lists').delete().eq('id', pl.id)
    const path = pl.url.split('/price-lists/')[1]
    if (path) await supabase.storage.from('price-lists').remove([decodeURIComponent(path)])
    setExistingPriceLists((prev) => prev.filter((p) => p.id !== pl.id))
  }

  const removeExistingImage = async (imageId: string, url: string) => {
    const supabase = createClient()
    const path = url.split('/product-image/')[1]
    if (path) await supabase.storage.from('product-image').remove([path])
    await supabase.from('product_images').delete().eq('id', imageId)
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    // 1. 상품 먼저 저장 (ID 확보)
    const basePayload = {
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      sku: form.sku || null,
      base_price: parseFloat(form.base_price) || 0,
      currency: form.currency,
      is_active: form.is_active,
      order_schedule: form.order_schedule || null,
      delivery_info: form.delivery_info || null,
      website_url: form.website_url || null,
    }

    let productId = product?.id

    if (isEdit) {
      const { error } = await supabase.from('products').update(basePayload).eq('id', product.id)
      if (error) { setError('Failed to save: ' + error.message); setLoading(false); return }
    } else {
      const { data, error } = await supabase.from('products').insert(basePayload).select().single()
      if (error || !data) { setError('Failed to save: ' + error?.message); setLoading(false); return }
      productId = data.id
    }

    // 2. 가격표 파일들 업로드 (productId 확보 후, 여러 개 가능)
    if (newPriceListFiles.length > 0 && productId) {
      for (let i = 0; i < newPriceListFiles.length; i++) {
        const file = newPriceListFiles[i]
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'xlsx'
        // Storage 경로는 영문/숫자만 (한글 파일명은 DB filename에 보존)
        const path = `${productId}/${Date.now()}-${i}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('price-lists')
          .upload(path, file, { upsert: true })

        if (uploadError) {
          setError('Price list upload failed: ' + uploadError.message)
          setLoading(false)
          return
        }

        const { data: urlData } = supabase.storage.from('price-lists').getPublicUrl(uploadData.path)
        await supabase.from('price_lists').insert({
          product_id: productId,
          url: urlData.publicUrl,
          filename: file.name,
        })
      }
    }

    // 이미지 업로드
    if (newFiles.length > 0 && productId) {
      for (const file of newFiles) {
        const rawExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const ext = rawExt === 'jfif' ? 'jpg' : rawExt
        const path = `${productId}/${Date.now()}.${ext}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-image')
          .upload(path, file, { upsert: true, contentType: 'image/jpeg' })

        if (uploadError) {
          setError('Image upload failed: ' + uploadError.message)
          setLoading(false)
          return
        }

        if (uploadData) {
          const { data: urlData } = supabase.storage.from('product-image').getPublicUrl(uploadData.path)
          await supabase.from('product_images').insert({
            product_id: productId,
            url: urlData.publicUrl,
            sort_order: existingImages.length,
          })
        }
      }
    }

    router.push(`/${locale}/admin/products`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 브랜드 자동 검색 */}
      <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-semibold text-blue-900 mb-1">
          🔍 브랜드 자동 검색
        </label>
        <p className="text-xs text-blue-700 mb-2">영문 브랜드명을 입력하면 회사명·홈페이지·로고를 자동으로 채워줍니다. (예: missha, laneige)</p>
        <input
          type="text"
          onChange={(e) => handleBrandSearch(e.target.value)}
          placeholder="브랜드 이름 검색..."
          className="w-full border border-blue-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {searching && <p className="text-xs text-blue-600 mt-2">로고 가져오는 중...</p>}
        {suggestions.length > 0 && (
          <div className="absolute left-4 right-4 top-full -mt-1 bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.domain}
                type="button"
                onClick={() => applySuggestion(s)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left border-b last:border-b-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.logo} alt={s.name} className="w-8 h-8 rounded object-contain bg-gray-50" />
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.domain}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          브랜드명 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder="e.g. ABIB"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">홈페이지 URL</label>
        <input
          type="url"
          value={form.website_url}
          onChange={(e) => setForm({ ...form, website_url: e.target.value })}
          placeholder="https://..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          placeholder="브랜드 소개"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Skincare, Makeup"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">코드 (SKU)</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="e.g. ABIB-2604"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* 주문/배송 정보 */}
      <div className="border-t pt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">주문 · 배송 정보</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주문일</label>
            <input
              type="text"
              value={form.order_schedule}
              onChange={(e) => setForm({ ...form, order_schedule: e.target.value })}
              placeholder="e.g. every Wednesday"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">배송기간</label>
            <input
              type="text"
              value={form.delivery_info}
              onChange={(e) => setForm({ ...form, delivery_info: e.target.value })}
              placeholder="e.g. 2 weeks"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* 가격표 파일 (여러 개 가능) */}
      <div className="border-t pt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          가격표 (Price List) {existingPriceLists.length + newPriceListFiles.length > 0 && `— ${existingPriceLists.length + newPriceListFiles.length}개`}
        </p>

        {/* 기존 파일 목록 */}
        {existingPriceLists.map((pl) => (
          <div key={pl.id} className="flex items-center gap-3 mb-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <a href={pl.url} target="_blank" rel="noopener noreferrer"
              className="text-sm text-green-700 hover:underline flex-1 truncate">
              {pl.filename ?? '가격표 파일'}
            </a>
            <button type="button" onClick={() => removeExistingPriceList(pl)}
              className="text-xs text-red-400 hover:text-red-600 shrink-0">삭제</button>
          </div>
        ))}

        {/* 새로 추가할 파일 목록 */}
        {newPriceListFiles.map((file, i) => (
          <div key={i} className="flex items-center gap-3 mb-2 p-3 bg-blue-50 border border-blue-200 border-dashed rounded-lg">
            <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-blue-700 flex-1 truncate">{file.name} <span className="text-xs">(저장 시 업로드)</span></span>
            <button type="button" onClick={() => setNewPriceListFiles((prev) => prev.filter((_, j) => j !== i))}
              className="text-xs text-red-400 hover:text-red-600 shrink-0">제거</button>
          </div>
        ))}

        <label className="flex items-center gap-2 cursor-pointer w-fit border rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          파일 추가 (Excel / PDF, 여러 개 선택 가능)
          <input type="file" accept=".xlsx,.xls,.pdf,.csv" multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              setNewPriceListFiles((prev) => [...prev, ...files])
              e.target.value = ''
            }}
            className="hidden" />
        </label>
      </div>

      {/* 브랜드 로고 */}
      <div className="border-t pt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">브랜드 로고 / 이미지</p>

        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative w-24 h-24">
                <Image src={img.url} alt="product" fill sizes="96px" className="object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id, img.url)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24">
                <Image src={src} alt="preview" fill sizes="96px" className="object-cover rounded-lg border border-dashed border-gray-300" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer w-fit border rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          이미지 추가
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {/* 기준가 (참고용) */}
      <div className="border-t pt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">기준가 (내부 참고용)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기준가</label>
            <input
              type="number"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              min="0"
              step="0.01"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">통화</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="KRW">KRW</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="is_active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          활성화 (바이어에게 표시)
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? '저장 중...' : isEdit ? '저장' : '브랜드 등록'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  )
}
