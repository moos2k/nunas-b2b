import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a2236 0%, #0B1120 100%)',
        }}
      >
        <svg width="100" height="100" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19" cy="19" r="17.5" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
          <path d="M12 12L26 26M26 12L12 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
