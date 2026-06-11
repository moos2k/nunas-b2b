// 로고 4차: 남은 3개 브랜드, 직접 지정한 이미지 URL로 시도
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' }

const RETRY = [
  {
    name: '이즈앤트리 Isntree',
    website: 'https://theisntree.com',
    candidates: [
      'https://logo.clearbit.com/theisntree.com?size=256',
      'https://theisntree.com/favicon.ico',
      'https://www.google.com/s2/favicons?domain=theisntree.com&sz=128',
    ],
  },
  {
    name: '텐제로 TENZERO',
    website: 'https://en.tenzero.co.kr',
    candidates: [
      'https://en.tenzero.co.kr/favicon.ico',
      'https://tenzero.co.kr/favicon.ico',
      'https://logo.clearbit.com/en.tenzero.co.kr?size=256',
      'https://www.google.com/s2/favicons?domain=en.tenzero.co.kr&sz=128',
    ],
  },
  {
    name: '닥터엘시아 Dr. Althea',
    website: 'https://doctoraltheaglobal.com',
    candidates: [
      'https://doctoraltheaglobal.com/cdn/shop/files/Untitled_design.png?crop=center&height=256',
      'https://logo.clearbit.com/doctoraltheaglobal.com?size=256',
    ],
  },
]

for (const brand of RETRY) {
  const { data: product } = await supabase.from('products').select('id').eq('name', brand.name).maybeSingle()
  if (!product) { console.error(`❌ 브랜드 없음: ${brand.name}`); continue }

  const { data: existingImg } = await supabase.from('product_images').select('id').eq('product_id', product.id).limit(1)
  if (existingImg && existingImg.length > 0) { console.log(`⏭️  ${brand.name} — 이미 있음`); continue }

  let buf = null, contentType = 'image/png', used = null
  for (const url of brand.candidates) {
    try {
      const res = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(15000) })
      if (!res.ok) continue
      const b = Buffer.from(await res.arrayBuffer())
      if (b.length > 800) {
        buf = b
        contentType = res.headers.get('content-type') ?? 'image/png'
        used = url
        break
      }
    } catch { /* 다음 후보 */ }
  }

  if (!buf) { console.warn(`⚠️  ${brand.name} — 실패 (관리자 화면에서 직접 업로드)`); continue }

  const ext = contentType.includes('ico') ? 'ico' : contentType.includes('jpeg') ? 'jpg' : 'png'
  const storagePath = `${product.id}/logo.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('product-image')
    .upload(storagePath, buf, { upsert: true, contentType })
  if (uploadError) { console.error(`❌ ${brand.name} 업로드 실패: ${uploadError.message}`); continue }

  const { data: urlData } = supabase.storage.from('product-image').getPublicUrl(storagePath)
  await supabase.from('product_images').insert({ product_id: product.id, url: urlData.publicUrl, sort_order: 0 })
  await supabase.from('products').update({ website_url: brand.website }).eq('id', product.id)

  console.log(`✅ ${brand.name} (${used.slice(0, 80)})`)
}

console.log('\n완료!')
