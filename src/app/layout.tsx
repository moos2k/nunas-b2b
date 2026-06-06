import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'Nunas B2B',
  description: 'Cosmetics B2B Order Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF9F7] text-[#1a1a1a]">
        <Navbar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  )
}
