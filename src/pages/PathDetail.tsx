import { Link, useParams } from 'react-router-dom'
import { PATH_BY_ID } from '../data/paths'
import { exercisesForPath } from '../data/exercises'
import { useAppStore } from '../store/useAppStore'
import { ExerciseCard } from '../components/ExerciseCard'
import { PoseFigure } from '../components/PoseFigure'

export default function PathDetail() {
  const { pathId } = useParams<{ pathId: string }>()
  const states = useAppStore((s) => s.exerciseStates)
  const path = pathId ? PATH_BY_ID[pathId] : undefined
  if (!path) return null

  const exercises = exercisesForPath(path.id)
  const currentId = exercises.find((e) => states[e.id] && !states[e.id].mastered)?.id

  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-safe">
      <header className="flex items-center gap-2 pt-6">
        <Link to="/journey" className="rounded-full p-2 text-ink-300" aria-label="Back to journey">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold">{path.name}</h1>
          <p className="text-xs text-ink-300">Goal: {path.goal}</p>
        </div>
      </header>

      <div className="card relative mt-5 overflow-hidden p-5">
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full opacity-25 blur-3xl"
          style={{ background: `radial-gradient(circle, ${path.color}, transparent 70%)` }}
        />
        <div className="h-28">
          <PoseFigure poseId={path.poseId} accent={path.color} className="h-full w-full" />
        </div>
        <p className="mt-2 text-center text-sm italic text-ink-200">“{path.tagline}”</p>
      </div>

      {/* level map */}
      <div className="relative mt-8">
        <div className="absolute bottom-6 left-[27px] top-2 w-0.5 bg-ink-600/70" />
        <div className="flex flex-col gap-4">
          {exercises.map((ex) => {
            const state = states[ex.id]
            const locked = !state
            const isCurrent = ex.id === currentId
            return (
              <div key={ex.id} className="relative flex items-start gap-3">
                <div className="z-10 mt-8 flex size-7 shrink-0 items-center justify-center">
                  {state?.mastered ? (
                    <div
                      className="flex size-7 items-center justify-center rounded-full"
                      style={{ background: path.color }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="#0a0b0f" strokeWidth="3" className="size-4">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : isCurrent ? (
                    <div
                      className="size-7 animate-pulse-soft rounded-full border-[3px] bg-ink-900"
                      style={{ borderColor: path.color }}
                    />
                  ) : (
                    <div className="size-4 rounded-full border-2 border-ink-600 bg-ink-800" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <ExerciseCard exercise={ex} state={state} locked={locked} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
