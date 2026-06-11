'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Props {
  locale: string
  isKo: boolean
  customerId: string
}

const ACCEPTED = ['.xlsx', '.xls', '.csv', '.pdf']

export default function OrderForm({ locale, isKo, customerId }: Props) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [note, setNote] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter((f) =>
      ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext))
    )
    if (valid.length < Array.from(incoming).length) {
      setError(isKo ? '엑셀/CSV/PDF 파일만 첨부할 수 있습니다.' : 'Only Excel, CSV, or PDF files are accepted.')
    } else {
      setError('')
    }
    setFiles((prev) => [...prev, ...valid])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      setError(isKo ? '발주서 파일을 1개 이상 첨부해 주세요.' : 'Please attach at least one order sheet.')
      return
    }
    setError('')
    setLoading(true)

    const supabase = createClient()

    // 1. 주문 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ customer_id: customerId, note: note || null })
      .select('id')
      .single()

    if (orderError || !order) {
      setError(isKo ? '주문 생성에 실패했습니다. 다시 시도해주세요.' : 'Failed to create order. Please try again.')
      setLoading(false)
      return
    }

    // 2. 발주서 파일 업로드 + 연결
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'xlsx'
      const path = `${order.id}/${Date.now()}-${i}.${ext}` // 경로는 영문/숫자 (원본명은 DB에 보존)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order-files')
        .upload(path, file)

      if (uploadError) {
        setError((isKo ? '파일 업로드 실패: ' : 'File upload failed: ') + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('order-files').getPublicUrl(uploadData.path)
      await supabase.from('order_files').insert({
        order_id: order.id,
        url: urlData.publicUrl,
        filename: file.name,
      })
    }

    router.push(`/${locale}/orders/${order.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* 파일 첨부 — 클릭 또는 드래그&드롭 */}
      <div>
        <label className="block text-xs font-semibold tracking-[0.05em] uppercase text-[#45464d] mb-2">
          {isKo ? '발주서 파일' : 'Order Sheet'} <span className="text-[#ba1a1a]">*</span>
        </label>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`cursor-pointer border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
            dragging ? 'border-[#0F172A] bg-[#0F172A]/5' : 'border-[#c6c6cd] bg-white hover:border-[#0F172A]'
          }`}
        >
          <svg className="w-10 h-10 mx-auto mb-3 text-[#c6c6cd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-[#191c1d]">
            {isKo ? '파일을 끌어다 놓거나 클릭해서 선택' : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-xs text-[#76777d] mt-1">Excel (.xlsx, .xls), CSV, PDF</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            multiple
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
            className="hidden"
          />
        </div>

        {/* 첨부된 파일 목록 */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white border border-[#E2E8F0] rounded-lg">
                <svg className="w-5 h-5 text-[#0F172A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-[#191c1d] flex-1 truncate">{file.name}</span>
                <span className="text-xs text-[#76777d] shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="text-xs text-[#ba1a1a] hover:underline shrink-0">
                  {isKo ? '제거' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-xs font-semibold tracking-[0.05em] uppercase text-[#45464d] mb-2">
          {isKo ? '메모 (선택)' : 'Note (optional)'}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={isKo ? '배송 요청사항, 문의 내용 등' : 'Shipping requests, questions, etc.'}
          className="w-full border border-[#c6c6cd] bg-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-b-2 focus:border-b-[#0F172A] transition-colors resize-none placeholder:text-[#c6c6cd]"
        />
      </div>

      {error && <p className="text-[#ba1a1a] text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white py-3.5 text-xs font-semibold tracking-[0.1em] uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-40"
        style={{ backgroundColor: '#0F172A' }}
      >
        {loading
          ? (isKo ? '제출 중...' : 'Submitting...')
          : (isKo ? '발주서 제출' : 'Submit Order')}
      </button>
    </form>
  )
}
