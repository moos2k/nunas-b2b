import { cache } from 'react'
import { createClient } from './server'

// React cache() — 같은 요청 내에서 중복 호출 시 DB 쿼리 1번만 실행
export const getProfile = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, company, country')
    .eq('id', user.id)
    .single()

  return profile
})
