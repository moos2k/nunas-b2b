import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  open: '🔵 Open', answered: '✅ Answered', closed: '⬜ Closed',
}

export default async function AdminInquiriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const [profile, { data: inquiries }] = await Promise.all([
    getProfile(),
    supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (profile.role !== 'admin') redirect(`/${locale}/products`)

  const customerIds = [...new Set(inquiries?.map((i) => i.customer_id) ?? [])]
  const { data: profilesList } = customerIds.length
    ? await supabase.from('profiles').select('id, full_name, company').in('id', customerIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profilesList ?? []).map((p) => [p.id, p]))

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href={`/${locale}/admin`} className="text-sm text-gray-400 hover:underline">← Dashboard</Link>
        <h1 className="text-2xl font-bold mt-1">Inquiries</h1>
      </div>
      <div className="border rounded-lg overflow-hidden bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inquiries?.map((inq) => (
              <tr key={inq.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{inq.title}</td>
                <td className="px-4 py-3 text-gray-500">{profileMap[inq.customer_id]?.company ?? profileMap[inq.customer_id]?.full_name ?? '-'}</td>
                <td className="px-4 py-3">{STATUS_LABEL[inq.status]}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(inq.created_at).toLocaleDateString('en-US')}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/${locale}/admin/inquiries/${inq.id}`} className="text-blue-500 hover:underline">Reply</Link>
                </td>
              </tr>
            ))}
            {(!inquiries || inquiries.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No inquiries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
