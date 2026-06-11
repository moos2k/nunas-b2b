// 옛 상품단위 주문 삭제 (order_items 기반, 발주서 파일 없는 주문)
// 실행: node scripts/delete-legacy-orders.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// 모든 주문 + 발주서 파일 개수 조회
const { data: orders } = await supabase
  .from('orders')
  .select('id, created_at, order_items(id), order_files(id)')

if (!orders) { console.error('주문 조회 실패'); process.exit(1) }

// 발주서 파일이 없는 = 옛 방식(또는 빈) 주문
const legacy = orders.filter((o) => (o.order_files?.length ?? 0) === 0)
console.log(`전체 주문 ${orders.length}건, 발주서 파일 없는 옛 주문 ${legacy.length}건 삭제 예정\n`)

for (const o of legacy) {
  // order_items 먼저 삭제 (FK)
  await supabase.from('order_items').delete().eq('order_id', o.id)
  const { error } = await supabase.from('orders').delete().eq('id', o.id)
  if (error) console.error(`❌ ${o.id.slice(0, 8)} 삭제 실패: ${error.message}`)
  else console.log(`🗑️  ${o.id.slice(0, 8)} (${new Date(o.created_at).toLocaleDateString('ko-KR')}) 삭제`)
}

console.log('\n완료!')
