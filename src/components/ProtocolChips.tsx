import type { Exercise } from '../types'
import type { AgeGroup } from '../types'
import { scaleProtocol } from '../engine/adaptive'
import { formatSeconds } from '../lib/dates'

export function protocolSummary(ex: Exercise, age: AgeGroup): { work: string; rest: string; tempo?: string } {
  const p = scaleProtocol(ex.protocol, age)
  const side = p.perSide ? ' / side' : ''
  const work =
    ex.type === 'dynamic'
      ? `${p.sets} × ${p.repsMin}–${p.repsMax} reps${side}`
      : `${p.sets} × ${p.holdMin}–${p.holdMax}s hold${side}`
  return { work, rest: `${formatSeconds(p.restSeconds)} rest`, tempo: p.tempo }
}

export function ProtocolChips({ ex, age }: { ex: Exercise; age: AgeGroup }) {
  const { work, rest, tempo } = protocolSummary(ex, age)
  return (
    <div className="flex flex-wrap gap-2">
      <span className="chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
          <path d="M6 5v14M18 5v14M6 12h12" strokeLinecap="round" />
        </svg>
        {work}
      </span>
      <span className="chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
          <circle cx="12" cy="13" r="7" />
          <path d="M12 10v3.5l2 2M10 3h4" strokeLinecap="round" />
        </svg>
        {rest}
      </span>
      {tempo && <span className="chip">{tempo}</span>}
    </div>
  )
}
