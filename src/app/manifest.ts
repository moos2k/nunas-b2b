import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'J.ON International',
    short_name: 'J.ON',
    description: 'Korean Cosmetics Wholesale Distribution Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1120',
    theme_color: '#0B1120',
    icons: [
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { src: '/icon-192', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png' },
    ],
  }
}
