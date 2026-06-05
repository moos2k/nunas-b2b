'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Product {
  id: string
  name: string
  description: string | null
  category: string | null
  sku: string | null
  base_price: number
  currency: string
  is_active: boolean
}

interface Props {
  product?: Product
}

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    category: product?.category ?? '',
    sku: product?.sku ?? '',
    base_price: product?.base_price?.toString() ?? '',
    currency: product?.currency ?? 'USD',
    is_active: product?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const payload = {
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      sku: form.sku || null,
      base_price: parseFloat(form.base_price),
      currency: form.currency,
      is_active: form.is_active,
    }

    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)

    if (error) {
      setError('Failed to save: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Serum, Toner"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="e.g. SKU-001"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Price <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: e.target.value })}
            required
            min="0"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="KRW">KRW</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Active (visible to customers)
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
