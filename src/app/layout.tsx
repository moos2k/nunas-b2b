import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Cormorant_Garamond, Montserrat, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'
import InstallPrompt from '@/components/install-prompt'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
})
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-montserrat',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'J.ON International',
  description: 'Korean Cosmetics Wholesale Distribution Platform',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'J.ON',
  },
  icons: {
    icon: [
      { url: '/icons/icon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#0B1120',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${geist.variable} ${cormorant.variable} ${montserrat.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#191c1d]" style={{ fontFamily: 'var(--font-inter)' }}>
        <Navbar />
        <div className="flex-1">{children}</div>
        <InstallPrompt />
      </body>
    </html>
  )
}
