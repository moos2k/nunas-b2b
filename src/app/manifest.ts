import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'J.ON International',
    short_name: 'J.ON',
    description: 'Korean Cosmetics Wholesale Distribution Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF9F7',
    theme_color: '#0B1120',
    icons: [
      { src: '/icons/icon-64.png', sizes: '64x64', type: 'image/png' },
      { src: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
