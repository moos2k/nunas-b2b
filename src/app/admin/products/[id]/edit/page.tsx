import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../../product-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/products')

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/admin/products" className="text-sm text-gray-400 hover:underline mb-6 block">
        ← 상품 목록
      </Link>
      <h1 className="text-2xl font-bold mb-8">상품 수정</h1>
      <ProductForm product={product} />
    </main>
  )
}
