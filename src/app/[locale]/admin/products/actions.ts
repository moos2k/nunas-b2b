'use server'

import { createClient } from '@/utils/supabase/server'

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' }

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

// 도메인으로 로고 이미지를 수집해 base64로 반환 (클라이언트에서 파일로 변환해 기존 업로드 흐름 재사용)
export async function fetchBrandLogo(domain: string): Promise<{ base64?: string; contentType?: string; error?: string }> {
  if (!await checkAdmin()) return { error: 'Unauthorized' }

  const candidates = [
    `https://logo.clearbit.com/${domain}?size=256`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ]

  // 사이트 og:image도 후보에 추가
  try {
    const res = await fetch(`https://${domain}`, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(8000) })
    if (res.ok) {
      const html = await res.text()
      const og = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
        ?? html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      if (og) {
        let url = og[1]
        if (url.startsWith('//')) url = 'https:' + url
        else if (url.startsWith('/')) url = `https://${domain}` + url
        candidates.splice(1, 0, url) // clearbit 다음 순위로
      }
    }
  } catch { /* og 수집 실패는 무시 */ }

  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(8000) })
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length > 800) {
        return {
          base64: buf.toString('base64'),
          contentType: res.headers.get('content-type') ?? 'image/png',
        }
      }
    } catch { /* 다음 후보 */ }
  }

  return { error: '로고를 찾지 못했습니다.' }
}
