'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = pathname.split('/')[1] || 'en'
  const otherLocale = currentLocale === 'en' ? 'ko' : 'en'
  const otherLabel = currentLocale === 'en' ? '한국어' : 'EN'

  const handleSwitch = () => {
    // /en/products/123 → /ko/products/123
    const newPath = pathname.replace(`/${currentLocale}`, `/${otherLocale}`)
    router.push(newPath)
  }

  return (
    <button
      onClick={handleSwitch}
      className="text-xs tracking-widest text-[#888] hover:text-[#1a1a1a] transition-colors border-b border-transparent hover:border-[#1a1a1a]"
    >
      {otherLabel}
    </button>
  )
}
