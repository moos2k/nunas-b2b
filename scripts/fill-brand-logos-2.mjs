// 로고 2차 수집: 사이트 HTML에서 og:image / 아이콘 추출 (1회성 운영 도구)
// 실행: node scripts/fill-brand-logos-2.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// 실패했던 브랜드들 — 후보 도메인 여러 개씩 시도
const RETRY = [
  { name: '미샤 BB 대량 (47종)', domains: ['missha.net', 'misshaus.com'] },
  { name: '미샤 BB MISSHA (면세)', domains: ['missha.net', 'misshaus.com'] },
  { name: '미샤 · 어퓨 · 초공진 통합 (면장필수)', domains: ['missha.net', 'misshaus.com'] },
  { name: '이즈앤트리 Isntree', domains: ['theisntree.com'] },
  { name: '텐제로 TENZERO', domains: ['en.tenzero.co.kr'] },
  { name: '닥터엘시아 Dr. Althea', domains: ['doctoraltheaglobal.com'] },
]

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }

async function tryFetch(url) {
  try {
    const res = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    return res
  } catch { return null }
}

async function findImage(domain) {
  // 1. HTML에서 og:image 추출
  for (const base of [`https://${domain}`, `https://www.${domain}`]) {
    const res = await tryFetch(base)
    if (!res) continue
    const html = await res.text()
    const og = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
    const iconMatch = html.match(/<link[^>]*rel=["'](?:apple-touch-icon|icon)["'][^>]*href=["']([^"']+)["']/i)

    for (const m of [og, iconMatch]) {
      if (!m) continue
      let imgUrl = m[1]
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
      else if (imgUrl.startsWith('/')) imgUrl = base + imgUrl
      const imgRes = await tryFetch(imgUrl)
      if (imgRes) {
        const buf = Buffer.from(await imgRes.arrayBuffer())
        if (buf.length > 2000) return { buf, contentType: imgRes.headers.get('content-type') ?? 'image/png' }
      }
    }
  }
  // 2. Clearbit 재시도
  const cb = await tryFetch(`https://logo.clearbit.com/${domain}?size=256`)
  if (cb) {
    const buf = Buffer.from(await cb.arrayBuffer())
    if (buf.length > 1000) return { buf, contentType: 'image/png' }
  }
  return null
}

for (const brand of RETRY) {
  const dbName = brand.dbName ?? brand.name
  const { data: product } = await supabase.from('products').select('id').eq('name', dbName).maybeSingle()
  if (!product) { console.error(`❌ 브랜드 없음: ${dbName}`); continue }

  const { data: existingImg } = await supabase.from('product_images').select('id').eq('product_id', product.id).limit(1)
  if (existingImg && existingImg.length > 0) { console.log(`⏭️  ${dbName} — 이미 있음`); continue }

  let found = null
  let usedDomain = null
  for (const domain of brand.domains) {
    found = await findImage(domain)
    if (found) { usedDomain = domain; break }
  }

  if (!found) { console.warn(`⚠️  ${dbName} — 여전히 못 찾음`); continue }

  const ext = found.contentType.includes('jpeg') || found.contentType.includes('jpg') ? 'jpg' : 'png'
  const storagePath = `${product.id}/logo.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('product-image')
    .upload(storagePath, found.buf, { upsert: true, contentType: found.contentType })
  if (uploadError) { console.error(`❌ ${dbName} 업로드 실패: ${uploadError.message}`); continue }

  const { data: urlData } = supabase.storage.from('product-image').getPublicUrl(storagePath)
  await supabase.from('product_images').insert({ product_id: product.id, url: urlData.publicUrl, sort_order: 0 })

  // 홈페이지 URL도 성공한 도메인으로 갱신
  await supabase.from('products').update({ website_url: `https://${usedDomain}` }).eq('id', product.id)

  console.log(`✅ ${dbName} (${usedDomain})`)
}

console.log('\n완료!')
