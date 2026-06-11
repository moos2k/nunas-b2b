// 같은 브랜드의 여러 카드를 하나로 병합 (가격표를 대상 카드로 이동 후 나머지 삭제)
// 실행: node scripts/merge-brands.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const MERGES = [
  {
    keep: '라운드랩 ROUND LAB (과세)',
    newName: '라운드랩 ROUND LAB',
    absorb: ['라운드랩 ROUND LAB (영세)'],
  },
  {
    keep: '미샤 BB MISSHA (면세)',
    newName: '미샤 MISSHA',
    absorb: ['미샤 BB 대량 (47종)', '미샤 · 어퓨 · 초공진 통합 (면장필수)'],
  },
]

for (const m of MERGES) {
  const { data: target } = await supabase.from('products').select('id').eq('name', m.keep).maybeSingle()
  if (!target) { console.error(`❌ 대상 없음: ${m.keep}`); continue }

  for (const sourceName of m.absorb) {
    const { data: source } = await supabase.from('products').select('id').eq('name', sourceName).maybeSingle()
    if (!source) { console.warn(`⚠️  병합원 없음(이미 처리됨?): ${sourceName}`); continue }

    // 가격표를 대상 카드로 이동
    const { error: moveError } = await supabase
      .from('price_lists')
      .update({ product_id: target.id })
      .eq('product_id', source.id)
    if (moveError) { console.error(`❌ 가격표 이동 실패 (${sourceName}): ${moveError.message}`); continue }

    // 병합원 카드의 이미지 레코드 삭제 후 카드 삭제
    await supabase.from('product_images').delete().eq('product_id', source.id)
    const { error: delError } = await supabase.from('products').delete().eq('id', source.id)
    if (delError) {
      console.error(`❌ 카드 삭제 실패 (${sourceName}): ${delError.message} — 주문에 사용된 카드일 수 있음`)
      continue
    }
    console.log(`  ↪ ${sourceName} → 병합 완료`)
  }

  // 대상 카드 이름 정리
  await supabase.from('products').update({ name: m.newName }).eq('id', target.id)
  console.log(`✅ ${m.newName}`)
}

// 결과 확인
const { data: check } = await supabase
  .from('products')
  .select('name, price_lists(filename)')
  .in('name', MERGES.map((m) => m.newName))
for (const p of check ?? []) {
  console.log(`\n[${p.name}] 가격표 ${p.price_lists.length}개:`)
  p.price_lists.forEach((pl) => console.log(`  - ${pl.filename}`))
}
