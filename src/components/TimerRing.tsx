interface TimerRingProps {
  /** 0..1 fraction of the ring filled. */
  progress: number
  size?: number
  stroke?: number
  color?: string
  trackColor?: string
  children?: React.ReactNode
}

/** Circular progress ring with centered content — the session timer face. */
export function TimerRing({
  progress,
  size = 260,
  stroke = 10,
  color = '#bef264',
  trackColor = 'rgba(76, 84, 112, 0.35)',
  children,
}: TimerRingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, progress))

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 0.3s linear', filter: `drop-shadow(0 0 12px ${color}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
