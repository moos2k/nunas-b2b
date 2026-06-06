import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/queries'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../../product-form'

interface Props { params: Promise<{ locale: string; id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()

  const [profile, { data: product }, { data: images }] = await Promise.all([
    getProfile(),
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('product_images').select('*').eq('product_id', id).order('sort_order'),
  ])

  if (!profile) redirect(`/${locale}/login`)
  if (profile.role !== 'admin') redirect(`/${locale}/products`)
  if (!product) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/${locale}/admin/products`} className="text-sm text-gray-400 hover:underline mb-6 block">← Products</Link>
      <h1 className="text-2xl font-bold mb-8">Edit Product</h1>
      <ProductForm product={product} images={images ?? []} />
    </main>
  )
}
