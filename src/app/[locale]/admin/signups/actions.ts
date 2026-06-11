'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendMail, approvalEmail, rejectionEmail } from '@/utils/email'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

export async function approveSignup(requestId: string, email: string) {
  if (!await checkAdmin()) return { error: 'Unauthorized' }

  const service = getServiceClient()

  // profiles 테이블에서 해당 이메일의 유저를 찾아 status를 active로 변경
  const { data: authUsers } = await service.auth.admin.listUsers()
  const targetUser = authUsers?.users.find((u) => u.email === email)

  if (!targetUser) return { error: 'User not found. They may not have completed signup.' }

  const { error: profileError } = await service
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', targetUser.id)

  if (profileError) return { error: profileError.message }

  // signup_requests 상태도 approved로
  await service.from('signup_requests').update({ status: 'approved' }).eq('id', requestId)

  // 승인 안내 메일 발송 (실패해도 승인 처리는 유지)
  const { data: req } = await service.from('signup_requests').select('full_name').eq('id', requestId).single()
  const mail = approvalEmail(req?.full_name ?? email)
  await sendMail(email, mail.subject, mail.html)

  revalidatePath('/admin/signups')
  return { success: true }
}

export async function rejectSignup(requestId: string, email: string) {
  if (!await checkAdmin()) return { error: 'Unauthorized' }

  const service = getServiceClient()

  // signup_requests 상태를 rejected로
  await service.from('signup_requests').update({ status: 'rejected' }).eq('id', requestId)

  // 해당 유저 계정 비활성화
  const { data: authUsers } = await service.auth.admin.listUsers()
  const targetUser = authUsers?.users.find((u) => u.email === email)
  if (targetUser) {
    await service.from('profiles').update({ status: 'rejected' }).eq('id', targetUser.id)
  }

  // 거절 안내 메일 발송 (실패해도 거절 처리는 유지)
  const { data: req } = await service.from('signup_requests').select('full_name').eq('id', requestId).single()
  const mail = rejectionEmail(req?.full_name ?? email)
  await sendMail(email, mail.subject, mail.html)

  revalidatePath('/admin/signups')
  return { success: true }
}
