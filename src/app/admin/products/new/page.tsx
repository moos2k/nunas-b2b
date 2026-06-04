import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../product-form'

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/products')

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/admin/products" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← 상품 목록
      </Link>
      <h1 className="text-2xl font-bold mb-8">상품 등록</h1>
      <ProductForm />
    </main>
  )
}
