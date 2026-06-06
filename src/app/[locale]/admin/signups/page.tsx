import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignupActionsClient from './signup-actions-client'

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export default async function AdminSignupsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const [profile, { data: requests }] = await Promise.all([
    getProfile(),
    supabase.from('signup_requests').select('*').order('created_at', { ascending: false }),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (profile.role !== 'admin') redirect(`/${locale}/products`)

  const pending = requests?.filter((r) => r.status === 'pending').length ?? 0

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href={`/${locale}/admin`} className="text-sm text-gray-400 hover:underline">← Dashboard</Link>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-2xl font-bold">Sign-up Requests</h1>
          {pending > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {pending} pending
            </span>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Applicant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Country</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Business No.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests?.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{req.full_name}</p>
                  <p className="text-xs text-gray-400">{req.email}</p>
                </td>
                <td className="px-4 py-3">{req.company}</td>
                <td className="px-4 py-3">{req.country}</td>
                <td className="px-4 py-3 text-gray-500">{req.business_number ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500">{req.phone ?? '-'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 border rounded-full ${STATUS_STYLE[req.status]}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {req.status === 'pending' ? (
                    <SignupActionsClient
                      requestId={req.id}
                      email={req.email}
                      fullName={req.full_name}
                      company={req.company}
                      country={req.country}
                    />
                  ) : (
                    <span className="text-xs text-gray-300">{req.status}</span>
                  )}
                </td>
              </tr>
            ))}
            {(!requests || requests.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No applications yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
