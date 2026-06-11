// 브랜드 홈페이지/로고 자동 입력 스크립트 (1회성 운영 도구)
// 실행: node scripts/fill-brand-meta.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// 브랜드명(DB의 name과 일치) → 공식 도메인
const BRAND_SITES = [
  { name: '라운드랩 ROUND LAB (과세)', domain: 'roundlab.co.kr' },
  { name: '라운드랩 ROUND LAB (영세)', domain: 'roundlab.co.kr' },
  { name: '미팩토리', domain: 'mefactory.co.kr' },
  { name: '라네즈 · 설화수 LANEIGE · Sulwhasoo', domain: 'laneige.com' },
  { name: '셀리맥스 celimax', domain: 'celimax.co.kr' },
  { name: '에뛰드 ETUDE', domain: 'etude.com' },
  { name: '케이시크릿', domain: 'ksecret.co.kr' },
  { name: '미샤 BB 대량 (47종)', domain: 'missha.com' },
  { name: '미샤 BB MISSHA (면세)', domain: 'missha.com' },
  { name: '이즈앤트리 Isntree', domain: 'isntree.com' },
  { name: '미샤 · 어퓨 · 초공진 통합 (면장필수)', domain: 'missha.com' },
  { name: '텐제로 TENZERO', domain: 'tenzero.co.kr' },
  { name: '르벨라쥬 LEBELAGE', domain: 'lebelage.co.kr' },
  { name: '메리앤메이 Mary&May (영세)', domain: 'maryandmay.com' },
  { name: '닥터엘시아 Dr. Althea', domain: 'dr-althea.com' },
  { name: '조선미녀 Beauty of Joseon', domain: 'beautyofjoseon.com' },
]

async function fetchLogo(domain) {
  // 1순위: Clearbit 로고 API
  const sources = [
    `https://logo.clearbit.com/${domain}?size=256`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, // 2순위: 구글 파비콘
  ]
  for (const url of sources) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length > 1000) return buf // 너무 작으면(기본 아이콘) 스킵
      }
    } catch { /* 다음 소스 시도 */ }
  }
  return null
}

for (const brand of BRAND_SITES) {
  const { data: product } = await supabase.from('products').select('id').eq('name', brand.name).maybeSingle()
  if (!product) {
    console.error(`❌ 브랜드 없음: ${brand.name}`)
    continue
  }

  // 1. 홈페이지 URL 입력
  await supabase.from('products').update({ website_url: `https://${brand.domain}` }).eq('id', product.id)

  // 2. 이미 로고가 있으면 스킵
  const { data: existingImg } = await supabase.from('product_images').select('id').eq('product_id', product.id).limit(1)
  if (existingImg && existingImg.length > 0) {
    console.log(`⏭️  ${brand.name} — 이미지 이미 있음, URL만 갱신`)
    continue
  }

  // 3. 로고 수집 → Storage 업로드 → product_images 연결
  const logo = await fetchLogo(brand.domain)
  if (!logo) {
    console.warn(`⚠️  ${brand.name} — 로고를 찾지 못함 (URL만 입력됨)`)
    continue
  }

  const storagePath = `${product.id}/logo.png`
  const { error: uploadError } = await supabase.storage
    .from('product-image')
    .upload(storagePath, logo, { upsert: true, contentType: 'image/png' })
  if (uploadError) {
    console.error(`❌ ${brand.name} 로고 업로드 실패: ${uploadError.message}`)
    continue
  }

  const { data: urlData } = supabase.storage.from('product-image').getPublicUrl(storagePath)
  await supabase.from('product_images').insert({ product_id: product.id, url: urlData.publicUrl, sort_order: 0 })

  console.log(`✅ ${brand.name} (${brand.domain})`)
}

console.log('\n완료!')
