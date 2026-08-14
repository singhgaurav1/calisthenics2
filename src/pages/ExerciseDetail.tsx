import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EXERCISE_BY_ID } from '../data/exercises'
import { PATH_BY_ID } from '../data/paths'
import { useAppStore } from '../store/useAppStore'
import { scaledMastery } from '../engine/adaptive'
import { PoseFigure } from '../components/PoseFigure'
import { ProtocolChips } from '../components/ProtocolChips'

export default function ExerciseDetail() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()
  const profile = useAppStore((s) => s.profile)
  const states = useAppStore((s) => s.exerciseStates)

  const ex = exerciseId ? EXERCISE_BY_ID[exerciseId] : undefined
  if (!ex || !profile) return null

  const path = PATH_BY_ID[ex.pathId]
  const state = states[ex.id]
  const unlocked = state !== undefined
  const mastery = scaledMastery(ex, profile.ageGroup)
  const isHold = ex.type !== 'dynamic'
  const best = isHold ? state?.bestHold : state?.bestReps
  const masteryValue = isHold ? mastery.holdSeconds : mastery.reps
  const masteryProgress =
    masteryValue !== undefined && best !== undefined ? Math.min(1, best / masteryValue) : 0

  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-safe">
      <header className="flex items-center gap-2 pt-6">
        <button onClick={() => navigate(-1)} className="rounded-full p-2 text-ink-300" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <p className="label-caps" style={{ color: path.color }}>
            {path.name} · Level {ex.level}
          </p>
          <h1 className="font-display text-2xl font-bold">{ex.name}</h1>
        </div>
      </header>

      {/* visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card relative mt-5 overflow-hidden p-6"
      >
        <div
          className="pointer-events-none absolute -left-12 -top-12 size-48 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, ${path.color}, transparent 70%)` }}
        />
        <div className="h-40">
          <PoseFigure poseId={ex.poseId} accent={path.color} className="h-full w-full" />
        </div>
        <p className="mt-2 text-center text-sm text-ink-200">{ex.summary}</p>
        <div className="mt-4 flex justify-center">
          <ProtocolChips ex={ex} age={profile.ageGroup} />
        </div>
      </motion.div>

      {/* why + mastery */}
      <section className="card mt-4 p-5">
        <p className="label-caps">Why this step</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-200">{ex.why}</p>
        <div className="mt-4 rounded-2xl bg-ink-800/70 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold text-ink-200">Mastery gate: {ex.masteryLabel}</p>
            {best !== undefined && best > 0 && (
              <p className="text-xs text-ink-300">
                Best: {best}
                {isHold ? 's' : ' reps'}
              </p>
            )}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-600/60">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round(masteryProgress * 100)}%`,
                background: path.color,
              }}
            />
          </div>
          <p className="mt-2 text-[11px] text-ink-400">
            {state?.mastered
              ? 'Mastered — the next level is unlocked.'
              : `Meet the standard in ${ex.mastery.sessions} separate sessions to unlock the next level. Streak: ${state?.masteryStreak ?? 0}/${ex.mastery.sessions}`}
          </p>
        </div>
      </section>

      {/* cues */}
      <section className="card mt-4 p-5">
        <p className="label-caps text-volt-400">Care abouts</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {ex.cues.map((cue, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="#bef264" strokeWidth="2.5" className="mt-0.5 size-4 shrink-0">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cue}
            </li>
          ))}
        </ul>
      </section>

      {/* pitfalls */}
      <section className="card mt-4 border-rose-450/20 p-5">
        <p className="label-caps text-rose-450">Pitfalls to avoid</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {ex.pitfalls.map((pit, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2.2" className="mt-0.5 size-4 shrink-0">
                <path d="M12 8v5m0 3.5v.5M10.3 3.9L2.6 17.1a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" strokeLinecap="round" />
              </svg>
              {pit}
            </li>
          ))}
        </ul>
      </section>

      {/* science */}
      <section className="card mt-4 p-5">
        <p className="label-caps text-aqua-400">The science</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-200">{ex.science}</p>
        {ex.youthNote && profile.ageGroup === 'kid' && (
          <p className="mt-3 rounded-xl bg-aqua-500/10 p-3 text-sm text-aqua-400">
            <span className="font-semibold">Young athlete note:</span> {ex.youthNote}
          </p>
        )}
      </section>

      {unlocked && (
        <button
          onClick={() => navigate(`/session?exercise=${ex.id}`)}
          className="btn-primary mt-6 w-full text-lg"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
          Train this now
        </button>
      )}
      {!unlocked && (
        <div className="btn-ghost mt-6 w-full cursor-default opacity-60">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 118 0v4" />
          </svg>
          Master the previous level to unlock
        </div>
      )}
    </div>
  )
}
