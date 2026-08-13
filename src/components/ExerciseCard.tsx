import { Link } from 'react-router-dom'
import type { Exercise, ExerciseState } from '../types'
import { PATH_BY_ID } from '../data/paths'
import { PoseFigure } from './PoseFigure'

const TYPE_LABEL: Record<Exercise['type'], string> = {
  isometric: 'Isometric hold',
  dynamic: 'Movement',
  mobility: 'Mobility',
}

interface ExerciseCardProps {
  exercise: Exercise
  state?: ExerciseState
  locked?: boolean
}

/** Compact exercise card used on path maps and the home plan. */
export function ExerciseCard({ exercise, state, locked }: ExerciseCardProps) {
  const path = PATH_BY_ID[exercise.pathId]
  const body = (
    <div className={`card-interactive flex items-center gap-4 p-4 ${locked ? 'opacity-45' : ''}`}>
      <div className="relative h-20 w-24 shrink-0 rounded-2xl bg-ink-800/80">
        <PoseFigure poseId={exercise.poseId} accent={path.color} className="h-full w-full" glow={!locked} />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 text-ink-300">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 118 0v4" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="label-caps" style={{ color: path.color }}>
            Level {exercise.level}
          </span>
          {state?.mastered && (
            <span className="chip border-volt-500/40 bg-volt-500/10 text-volt-400">Mastered</span>
          )}
        </div>
        <h3 className="mt-0.5 truncate font-display text-base font-semibold text-ink-100">{exercise.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-300">{exercise.summary}</p>
        <p className="mt-1 text-[11px] font-medium text-ink-400">{TYPE_LABEL[exercise.type]}</p>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0 text-ink-400">
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )

  if (locked) return body
  return <Link to={`/exercise/${exercise.id}`}>{body}</Link>
}
