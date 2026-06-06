'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Service Role 클라이언트 — 서버에서만 실행, RLS 우회
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function approveSignup(requestId: string, email: string, fullName: string, company: string, country: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const service = getServiceClient()

  // 임시 비밀번호 생성
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'

  // Supabase Auth 계정 생성
  const { data: newUser, error: authError } = await service.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError || !newUser.user) {
    return { error: authError?.message ?? 'Failed to create user' }
  }

  // profiles 테이블에 등록
  const { error: profileError } = await service.from('profiles').insert({
    id: newUser.user.id,
    role: 'customer',
    full_name: fullName,
    company,
    country,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  // 신청 상태를 approved로 변경
  await service.from('signup_requests').update({ status: 'approved' }).eq('id', requestId)

  revalidatePath('/admin/signups')
  return { success: true, tempPassword }
}

export async function rejectSignup(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const service = getServiceClient()
  await service.from('signup_requests').update({ status: 'rejected' }).eq('id', requestId)

  revalidatePath('/admin/signups')
  return { success: true }
}
