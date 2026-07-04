export function AppIcon({ size }: { size: number }) {
  const ringSize = size * 0.859
  const fontSize = size * 0.586
  const translateX = -size * 0.0273
  const translateY = size * 0.0195

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: '#0F172A',
      }}
    >
      <svg
        width={ringSize}
        height={ringSize}
        viewBox="0 0 440 440"
        style={{ position: 'absolute' }}
      >
        <circle
          cx="220"
          cy="220"
          r="205"
          stroke="#C5A059"
          strokeOpacity="0.45"
          strokeWidth="4"
          fill="none"
        />
      </svg>
      <span
        style={{
          fontSize,
          lineHeight: 1,
          fontWeight: 700,
          color: '#C5A059',
          fontFamily: 'serif',
          transform: `translate(${translateX}px, ${translateY}px)`,
        }}
      >
        J
      </span>
    </div>
  )
}
