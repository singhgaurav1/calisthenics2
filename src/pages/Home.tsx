import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore, computeStreak, pathProgress, rankFor } from '../store/useAppStore'
import { EXERCISE_BY_ID } from '../data/exercises'
import { PATHS, PATH_BY_ID } from '../data/paths'
import { DAILY_TIPS } from '../data/science'
import { PoseFigure } from '../components/PoseFigure'
import { ProgressRing } from '../components/ProgressRing'
import { greeting, lastNDays, todayISO } from '../lib/dates'

export default function Home() {
  const navigate = useNavigate()
  const profile = useAppStore((s) => s.profile)
  const plan = useAppStore((s) => s.plan)
  const planCompleted = useAppStore((s) => s.planCompleted)
  const ensurePlan = useAppStore((s) => s.ensurePlan)
  const regeneratePlan = useAppStore((s) => s.regeneratePlan)
  const logs = useAppStore((s) => s.sessionLogs)
  const states = useAppStore((s) => s.exerciseStates)
  const regressionFlags = useAppStore((s) => s.regressionFlags)

  useEffect(() => {
    ensurePlan()
  }, [ensurePlan])

  const streak = useMemo(() => computeStreak(logs), [logs])
  const week = useMemo(() => {
    const trained = new Set(logs.filter((l) => l.completed).map((l) => l.date))
    return lastNDays(7).map((d) => ({ date: d, trained: trained.has(d) }))
  }, [logs])

  const tip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length]
  const goalPaths = PATHS.filter((p) => profile?.goals.includes(p.id))

  if (!profile || !plan) return null

  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-safe">
      {/* header */}
      <header className="flex items-center justify-between pt-8">
        <div>
          <p className="label-caps">{greeting()}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{profile.name}</h1>
          <p className="mt-0.5 text-xs font-medium text-ink-300">{rankFor(states)}</p>
        </div>
        <div className="card flex items-center gap-2 px-4 py-2.5">
          <svg viewBox="0 0 24 24" className="size-5 text-ember-400" fill="currentColor">
            <path d="M13.5 1.5s.75 2.75-1.25 5.25S8.5 10 8.75 13c-1.5-1-2.25-2.5-2.25-2.5S4 13 4 16a8 8 0 0016 0c0-6.5-6.5-8.25-6.5-14.5z" />
          </svg>
          <span className="font-display text-xl font-bold">{streak}</span>
          <span className="text-[10px] leading-tight text-ink-300">
            day
            <br />
            streak
          </span>
        </div>
      </header>

      {/* week dots */}
      <div className="mt-5 flex justify-between">
        {week.map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-ink-400">
              {'SMTWTFS'[new Date(d.date + 'T12:00').getDay()]}
            </span>
            <div
              className={`size-2.5 rounded-full ${
                d.trained
                  ? 'bg-volt-400 shadow-[0_0_8px_rgba(190,242,100,0.6)]'
                  : d.date === todayISO()
                    ? 'border border-volt-400/60'
                    : 'bg-ink-600'
              }`}
            />
          </div>
        ))}
      </div>

      {/* regression advice */}
      {regressionFlags.length > 0 && (
        <div className="card mt-5 border-ember-500/30 bg-ember-500/5 p-4">
          <p className="text-sm text-ink-200">
            <span className="font-semibold text-ember-400">Coach’s note:</span>{' '}
            {regressionFlags
              .map((id) => EXERCISE_BY_ID[id]?.name)
              .filter(Boolean)
              .join(', ')}{' '}
            has been well below target lately. Consider revisiting the previous level for a week —
            stepping back is how you step forward.
          </p>
        </div>
      )}

      {/* today's session */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative mt-6 overflow-hidden p-6"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #bef264, transparent 70%)' }}
        />
        <p className="label-caps text-volt-400">Today’s session</p>
        <h2 className="mt-1 font-display text-2xl font-bold">{plan.focusLabel}</h2>
        <p className="mt-1 text-sm text-ink-300">
          {plan.exercises.length} exercises · ~
          {Math.max(10, Math.round(plan.exercises.reduce((a, e) => a + e.sets * (e.restSeconds + 40), 0) / 60))}{' '}
          min · rest filled with guided stretches
        </p>

        <div className="mt-4 flex flex-col gap-2.5">
          {plan.exercises.map((pe, i) => {
            const ex = EXERCISE_BY_ID[pe.exerciseId]
            const path = PATH_BY_ID[ex.pathId]
            return (
              <Link
                key={pe.exerciseId}
                to={`/exercise/${ex.id}`}
                className="flex items-center gap-3 rounded-2xl bg-ink-800/70 p-2.5"
              >
                <span className="w-5 text-center font-display text-sm font-bold text-ink-400">{i + 1}</span>
                <div className="h-12 w-14 shrink-0 rounded-xl bg-ink-700/50">
                  <PoseFigure poseId={ex.poseId} accent={path.color} className="h-full w-full" glow={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold">{ex.name}</p>
                  <p className="text-xs text-ink-300">
                    {pe.sets} sets ·{' '}
                    {pe.targetHold !== undefined ? `${pe.targetHold}s holds` : `${pe.targetReps} reps`}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {planCompleted ? (
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 rounded-2xl border border-volt-500/40 bg-volt-500/10 px-4 py-3.5 text-center font-display font-semibold text-volt-300">
              Session complete — see you tomorrow
            </div>
            <button onClick={regeneratePlan} className="btn-ghost px-4" title="Train again">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <path d="M4 12a8 8 0 0114-5m2-3v5h-5M20 12a8 8 0 01-14 5m-2 3v-5h5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/session')} className="btn-primary mt-5 w-full text-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path d="M8 5.5v13l11-6.5-11-6.5z" />
            </svg>
            Start Session
          </button>
        )}
      </motion.section>

      {/* path progress */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">Your paths</h2>
          <Link to="/journey" className="text-xs font-semibold text-volt-400">
            View all →
          </Link>
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5">
          {goalPaths.map((path) => {
            const prog = pathProgress(path.id, states)
            return (
              <Link key={path.id} to={`/journey/${path.id}`} className="card-interactive w-32 shrink-0 p-3.5">
                <ProgressRing progress={prog} color={path.color} size={52} stroke={4}>
                  <span className="font-display text-[11px] font-bold" style={{ color: path.color }}>
                    {Math.round(prog * 100)}%
                  </span>
                </ProgressRing>
                <p className="mt-2.5 font-display text-xs font-semibold leading-tight">{path.name}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* science tip */}
      <section className="card mt-6 p-5">
        <p className="label-caps text-aqua-400">Today’s science</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-200">{tip}</p>
        <Link to="/method" className="mt-3 inline-block text-xs font-semibold text-volt-400">
          The method behind Ascend →
        </Link>
      </section>
    </div>
  )
}
