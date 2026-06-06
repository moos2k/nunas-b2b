import { getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../product-form'

export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const profile = await getProfile()

  if (!profile) redirect(`/${locale}/login`)
  if (profile.role !== 'admin') redirect(`/${locale}/products`)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/${locale}/admin/products`} className="text-sm text-gray-400 hover:underline mb-6 block">← Products</Link>
      <h1 className="text-2xl font-bold mb-8">Add Product</h1>
      <ProductForm />
    </main>
  )
}
