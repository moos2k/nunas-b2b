// 가격표 엑셀 일괄 업로드 스크립트 (1회성 운영 도구)
// 실행: node scripts/bulk-upload-price-lists.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'

// .env.local 파싱
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const DIR = 'C:/Users/moos2/Documents/카카오톡 받은 파일/공급가 리스트/공급가 리스트'

const BRANDS = [
  { file: '주문서_라운드랩(거래처) 과세 52%.xlsx', name: '라운드랩 ROUND LAB (과세)' },
  { file: '2026 제이온 라운드랩(영세)_260119.xlsx', name: '라운드랩 ROUND LAB (영세)' },
  { file: '(주)미팩토리 RR 제품리스트 거래처 전달용 6월.xlsx', name: '미팩토리' },
  { file: '2026 라네즈 설화수(과세)_260318 거래처.xlsx', name: '라네즈 · 설화수 LANEIGE · Sulwhasoo' },
  { file: '2026 셀리맥스(과세)_260610 거래처.xlsx', name: '셀리맥스 celimax' },
  { file: '2026 에뛰드하우스(과세)_260519 거래처.xlsx', name: '에뛰드 ETUDE' },
  { file: '2026 케이시크릿(과세)_2606 거래처.xlsx', name: '케이시크릿' },
  { file: 'BB_PO LIST_260408(대량_47)_거래처.xlsx', name: '미샤 BB 대량 (47종)' },
  { file: '미샤 면세 비비 리뉴얼 26.06 제이온.xlsx', name: '미샤 BB MISSHA (면세)' },
  { file: '이즈앤트리(과세)발주시르트 거래처.xlsx', name: '이즈앤트리 Isntree' },
  { file: '제이온 미샤_어퓨_초공진 통합 오더시트(26.04)_거래처 (면장필수).xlsx', name: '미샤 · 어퓨 · 초공진 통합 (면장필수)' },
  { file: '제이온 텐제로 발주서 (거래처) 2604.xlsx', name: '텐제로 TENZERO' },
  { file: '제이온_LEBELAGE_공급가리스트 (거래처) 2604.xlsx', name: '르벨라쥬 LEBELAGE' },
  { file: '제이온_Mary&May_영세_(260120).xlsx', name: '메리앤메이 Mary&May (영세)' },
  { file: '제이온_닥터엘시아_Dr. Althea 리스트_(260528).xlsx', name: '닥터엘시아 Dr. Althea' },
  { file: '조선미녀 거래처 발주서   2603  제이온.xlsx', name: '조선미녀 Beauty of Joseon' },
]

for (const brand of BRANDS) {
  const filePath = path.join(DIR, brand.file)
  let fileData
  try {
    fileData = readFileSync(filePath)
  } catch {
    console.error(`❌ 파일 없음: ${brand.file}`)
    continue
  }

  // 1. 같은 이름의 브랜드가 이미 있으면 재사용, 없으면 생성
  const { data: existing } = await supabase.from('products').select('id').eq('name', brand.name).maybeSingle()

  let productId = existing?.id
  if (!productId) {
    const { data: created, error } = await supabase
      .from('products')
      .insert({ name: brand.name, base_price: 0, currency: 'KRW', is_active: true })
      .select('id')
      .single()
    if (error) {
      console.error(`❌ ${brand.name} 생성 실패: ${error.message}`)
      continue
    }
    productId = created.id
  }

  // 2. 파일 업로드 (경로는 영문/숫자만: {productId}/price-list.xlsx)
  const storagePath = `${productId}/price-list.xlsx`
  const { error: uploadError } = await supabase.storage
    .from('price-lists')
    .upload(storagePath, fileData, {
      upsert: true,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  if (uploadError) {
    console.error(`❌ ${brand.name} 업로드 실패: ${uploadError.message}`)
    continue
  }

  // 3. 공개 URL을 상품에 연결
  const { data: urlData } = supabase.storage.from('price-lists').getPublicUrl(storagePath)
  await supabase.from('products').update({ price_list_url: urlData.publicUrl }).eq('id', productId)

  console.log(`✅ ${brand.name}${existing ? ' (기존 카드 갱신)' : ''}`)
}

console.log('\n완료!')
