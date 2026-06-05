import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nunas B2B',
  description: 'Cosmetics B2B Order Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.className}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  )
}
