'use client'

import { useState } from 'react'

interface OrderFile {
  id: string
  url: string
  filename: string | null
}

interface Props {
  files: OrderFile[]
  company: string       // 회사명 (없으면 담당자명)
  createdAt: string     // 주문 생성일
  isKo: boolean
  variant?: 'light' | 'admin'
}

// [발주]회사명_YYMMDD 형식의 ZIP 파일명
function zipName(company: string, createdAt: string) {
  const d = new Date(createdAt)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const safeCompany = (company || 'order').replace(/[\\/:*?"<>|]/g, '').trim()
  return `[발주]${safeCompany}_${yy}${mm}${dd}`
}

export default function OrderFiles({ files, company, createdAt, isKo, variant = 'light' }: Props) {
  const [zipping, setZipping] = useState(false)

  if (files.length === 0) return null

  const downloadAllZip = async () => {
    if (zipping) return
    setZipping(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      await Promise.all(
        files.map(async (f, i) => {
          const res = await fetch(f.url)
          const blob = await res.blob()
          zip.file(f.filename ?? `order-${i + 1}`, blob)
        })
      )
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${zipName(company, createdAt)}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setZipping(false)
    }
  }

  const isAdmin = variant === 'admin'

  return (
    <div className={isAdmin ? 'border rounded-lg p-5 mb-6 bg-white' : 'mb-10'}>
      <div className="flex items-center justify-between mb-3">
        <p className={isAdmin ? 'font-semibold text-gray-700' : 'text-[10px] tracking-[0.2em] uppercase text-[#888]'}>
          {isKo ? '발주서 파일' : 'Order Sheets'} ({files.length})
        </p>
        <button
          type="button"
          onClick={downloadAllZip}
          disabled={zipping}
          className={
            isAdmin
              ? 'inline-flex items-center gap-1.5 text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-700 disabled:opacity-50'
              : 'inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase border border-[#1a1a1a] text-[#1a1a1a] px-3 py-1.5 rounded hover:bg-[#1a1a1a] hover:text-white transition-colors disabled:opacity-50'
          }
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
          </svg>
          {zipping
            ? (isKo ? '준비 중...' : 'Preparing...')
            : (isKo ? '전체 다운로드 (ZIP)' : 'Download All (ZIP)')}
        </button>
      </div>

      <div className="space-y-2">
        {files.map((f) => (
          <a
            key={f.id}
            href={`${f.url}?download=${encodeURIComponent(f.filename ?? 'order-sheet')}`}
            className={
              isAdmin
                ? 'flex items-center gap-3 p-3 bg-gray-50 border rounded-lg hover:border-gray-400 transition-colors'
                : 'flex items-center gap-3 p-3 bg-white border border-[#e8e4de] rounded hover:border-[#1a1a1a] transition-colors'
            }
          >
            <svg className={`w-5 h-5 shrink-0 ${isAdmin ? 'text-gray-600' : 'text-[#1a1a1a]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={`text-sm flex-1 truncate ${isAdmin ? '' : 'text-[#1a1a1a]'}`}>{f.filename ?? 'order-sheet'}</span>
            <span className={`text-xs shrink-0 ${isAdmin ? 'text-blue-500' : 'text-[#888]'}`}>
              {isKo ? '다운로드' : 'Download'}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
