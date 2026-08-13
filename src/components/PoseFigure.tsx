import { POSES, type PoseProp } from '../data/poses'

interface PoseFigureProps {
  poseId: string
  accent?: string
  className?: string
  /** Show ambient glow behind the figure. */
  glow?: boolean
}

function Prop({ prop }: { prop: PoseProp }) {
  const stroke = 'currentColor'
  switch (prop.kind) {
    case 'floor':
      return (
        <line x1={6} y1={72} x2={114} y2={72} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      )
    case 'wall':
      return (
        <line x1={prop.x} y1={4} x2={prop.x} y2={72} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      )
    case 'bar':
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round">
          <line x1={prop.x1} y1={prop.y} x2={prop.x2} y2={prop.y} strokeWidth={2.6} />
          <line x1={prop.x1 + 2} y1={prop.y} x2={prop.x1 + 2} y2={2} opacity={0.5} />
          <line x1={prop.x2 - 2} y1={prop.y} x2={prop.x2 - 2} y2={2} opacity={0.5} />
        </g>
      )
    case 'pole':
      return (
        <line x1={prop.x} y1={2} x2={prop.x} y2={72} stroke={stroke} strokeWidth={2.6} strokeLinecap="round" />
      )
    case 'box':
      return (
        <rect
          x={prop.x}
          y={prop.y}
          width={prop.w}
          height={prop.h}
          rx={3}
          fill="currentColor"
          opacity={0.16}
          stroke={stroke}
          strokeWidth={1.6}
        />
      )
    case 'ball':
      return <circle cx={prop.x} cy={prop.y} r={prop.r} fill="none" stroke={stroke} strokeWidth={1.8} />
  }
}

/**
 * Renders a pose from the pose library as consistent line-art.
 * Props (floor/wall/bar…) are drawn muted; the body takes the accent color.
 */
export function PoseFigure({ poseId, accent = '#bef264', className, glow = true }: PoseFigureProps) {
  const pose = POSES[poseId]
  if (!pose) return null

  const body = (color: string, width: number, opacity = 1, blur?: string) => (
    <g
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={opacity}
      filter={blur}
    >
      {pose.lines.map((line, i) => (
        <polyline key={i} points={line.map((p) => p.join(',')).join(' ')} />
      ))}
    </g>
  )

  return (
    <svg viewBox="0 0 120 84" className={className} role="img" aria-label={`${poseId} pose illustration`}>
      {glow && (
        <defs>
          <filter id={`glow-${poseId}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
        </defs>
      )}
      <g className="text-ink-400" opacity={0.75}>
        {pose.props?.map((prop, i) => <Prop key={i} prop={prop} />)}
      </g>
      {glow && body(accent, 5.5, 0.4, `url(#glow-${poseId})`)}
      {body(accent, 4.2)}
      {glow && (
        <circle cx={pose.head[0]} cy={pose.head[1]} r={6.5} fill={accent} opacity={0.4} filter={`url(#glow-${poseId})`} />
      )}
      <circle cx={pose.head[0]} cy={pose.head[1]} r={5} fill={accent} />
    </svg>
  )
}
