import { Link } from 'react-router-dom'
import { PATHS } from '../data/paths'
import { exercisesForPath } from '../data/exercises'
import { useAppStore, pathProgress } from '../store/useAppStore'
import { currentExerciseOfPath } from '../engine/sessionBuilder'
import { PoseFigure } from '../components/PoseFigure'
import { ProgressRing } from '../components/ProgressRing'

export default function Journey() {
  const states = useAppStore((s) => s.exerciseStates)
  const profile = useAppStore((s) => s.profile)

  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-safe">
      <header className="pt-8">
        <h1 className="font-display text-3xl font-bold">The Journey</h1>
        <p className="mt-1 text-sm text-ink-300">
          Nine paths, one destination: mastery of your own bodyweight.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3">
        {PATHS.map((path) => {
          const prog = pathProgress(path.id, states)
          const current = currentExerciseOfPath(path.id, states)
          const total = exercisesForPath(path.id).length
          const isGoal = profile?.goals.includes(path.id)
          return (
            <Link key={path.id} to={`/journey/${path.id}`} className={`card-interactive flex items-center gap-4 p-4 ${isGoal ? '' : 'opacity-55'}`}>
              <div className="h-20 w-24 shrink-0 rounded-2xl bg-ink-800/80">
                <PoseFigure poseId={path.poseId} accent={path.color} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-semibold">{path.name}</h2>
                <p className="mt-0.5 truncate text-xs text-ink-300">{path.tagline}</p>
                <p className="mt-1.5 text-xs font-medium" style={{ color: path.color }}>
                  {current ? `Now: ${current.name} · L${current.level}/${total}` : 'Not started'}
                  {!isGoal && ' · not in goals'}
                </p>
              </div>
              <ProgressRing progress={prog} color={path.color} size={48} stroke={4}>
                <span className="font-display text-[10px] font-bold" style={{ color: path.color }}>
                  {Math.round(prog * 100)}%
                </span>
              </ProgressRing>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
