// 로고 3차 수집: 구글 파비콘 (카드 표시 56px라 128px 파비콘으로 충분)
// 실행: node scripts/fill-brand-logos-3.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const RETRY = [
  { name: '미샤 BB 대량 (47종)', domains: ['misshamall.com', 'missha.us', 'ablecnc.com'] },
  { name: '미샤 BB MISSHA (면세)', domains: ['misshamall.com', 'missha.us', 'ablecnc.com'] },
  { name: '미샤 · 어퓨 · 초공진 통합 (면장필수)', domains: ['misshamall.com', 'missha.us'] },
  { name: '이즈앤트리 Isntree', domains: ['isntree.com', 'en.isntree.com'] },
  { name: '텐제로 TENZERO', domains: ['tenzero.kr', 'tenzero.co.kr', 'smartstore.naver.com/tenzero'] },
  { name: '닥터엘시아 Dr. Althea', domains: ['dralthea.com', 'dr-althea.com', 'altheakorea.com'] },
]

for (const brand of RETRY) {
  const { data: product } = await supabase.from('products').select('id').eq('name', brand.name).maybeSingle()
  if (!product) { console.error(`❌ 브랜드 없음: ${brand.name}`); continue }

  const { data: existingImg } = await supabase.from('product_images').select('id').eq('product_id', product.id).limit(1)
  if (existingImg && existingImg.length > 0) { console.log(`⏭️  ${brand.name} — 이미 있음`); continue }

  let buf = null
  let usedDomain = null
  for (const domain of brand.domains) {
    try {
      const res = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`, {
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const b = Buffer.from(await res.arrayBuffer())
        if (b.length > 500) { buf = b; usedDomain = domain; break }
      }
    } catch { /* 다음 도메인 */ }
  }

  if (!buf) { console.warn(`⚠️  ${brand.name} — 파비콘도 없음 (관리자 화면에서 직접 업로드 필요)`); continue }

  const storagePath = `${product.id}/logo.png`
  const { error: uploadError } = await supabase.storage
    .from('product-image')
    .upload(storagePath, buf, { upsert: true, contentType: 'image/png' })
  if (uploadError) { console.error(`❌ ${brand.name} 업로드 실패`); continue }

  const { data: urlData } = supabase.storage.from('product-image').getPublicUrl(storagePath)
  await supabase.from('product_images').insert({ product_id: product.id, url: urlData.publicUrl, sort_order: 0 })

  if (!usedDomain.includes('smartstore')) {
    await supabase.from('products').update({ website_url: `https://${usedDomain}` }).eq('id', product.id)
  }

  console.log(`✅ ${brand.name} (${usedDomain} 파비콘)`)
}

console.log('\n완료!')
