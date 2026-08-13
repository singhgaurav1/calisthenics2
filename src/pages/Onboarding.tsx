import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { AgeGroup, Experience } from '../types'
import { PATHS } from '../data/paths'
import { PoseFigure } from '../components/PoseFigure'
import { useAppStore, type BaselineAnswers } from '../store/useAppStore'

const AGE_OPTIONS: { id: AgeGroup; label: string; range: string; note: string }[] = [
  { id: 'kid', label: 'Young Athlete', range: '8–12', note: 'Playful, technique-first, always safe' },
  { id: 'teen', label: 'Teen', range: '13–17', note: 'Building the engine for life' },
  { id: 'adult', label: 'Adult', range: '18–29', note: 'Full programming, full send' },
  { id: 'master', label: 'Prime', range: '30–40', note: 'Smart volume, lasting joints' },
]

const EXP_OPTIONS: { id: Experience; label: string; note: string }[] = [
  { id: 'new', label: 'Brand new', note: 'First structured training — welcome!' },
  { id: 'casual', label: 'Sometimes active', note: 'Occasional workouts, some basics' },
  { id: 'consistent', label: 'Train regularly', note: 'Consistent training for 6+ months' },
]

const STEPS = ['welcome', 'age', 'experience', 'baseline', 'goals', 'ready'] as const

export default function Onboarding() {
  const navigate = useNavigate()
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [goals, setGoals] = useState<string[]>(PATHS.filter((p) => p.id !== 'mobility').map((p) => p.id))
  const [baseline, setBaseline] = useState<BaselineAnswers>({
    maxPushups: 5,
    hangSeconds: 15,
    plankSeconds: 30,
    deepSquat: 'almost',
  })

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const finish = () => {
    completeOnboarding(
      {
        name: name.trim() || 'Athlete',
        ageGroup: ageGroup ?? 'adult',
        experience: experience ?? 'new',
        goals,
      },
      baseline,
    )
    navigate('/', { replace: true })
  }

  const canContinue =
    (STEPS[step] === 'welcome' && name.trim().length > 0) ||
    (STEPS[step] === 'age' && ageGroup !== null) ||
    (STEPS[step] === 'experience' && experience !== null) ||
    STEPS[step] === 'baseline' ||
    (STEPS[step] === 'goals' && goals.length > 0) ||
    STEPS[step] === 'ready'

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 pt-safe">
      {/* progress dots */}
      <div className="flex items-center gap-2 pt-8">
        {step > 0 && (
          <button onClick={back} className="mr-2 text-ink-300" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= step ? 'w-8 bg-volt-400' : 'w-4 bg-ink-600'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col pb-10 pt-8"
        >
          {STEPS[step] === 'welcome' && (
            <div className="flex flex-1 flex-col">
              <div className="mx-auto h-44 w-56 animate-float">
                <PoseFigure poseId="handstand" accent="#bef264" className="h-full w-full" />
              </div>
              <h1 className="mt-6 font-display text-4xl font-bold leading-tight">
                Ascend<span className="text-volt-400">.</span>
              </h1>
              <p className="mt-3 text-ink-200">
                A guided journey from your very first plank to handstand push-ups, levers, flags,
                pistols and muscle-ups. Built on real sport science, adapted to you every session.
              </p>
              <label className="label-caps mt-8">What should we call you?</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={20}
                className="mt-2 rounded-2xl border border-ink-600 bg-ink-800 px-5 py-4 font-display text-lg outline-none focus:border-volt-500"
              />
            </div>
          )}

          {STEPS[step] === 'age' && (
            <div>
              <h2 className="font-display text-3xl font-bold">How many trips around the sun?</h2>
              <p className="mt-2 text-sm text-ink-300">
                Ascend scales sets, hold caps and rest to your age group — the science of youth and
                adult training differs, and we respect it.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {AGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAgeGroup(opt.id)}
                    className={`card p-4 text-left transition-all ${
                      ageGroup === opt.id ? 'border-volt-500/70 bg-volt-500/10' : ''
                    }`}
                  >
                    <div className="font-display text-2xl font-bold text-volt-400">{opt.range}</div>
                    <div className="mt-1 font-display font-semibold">{opt.label}</div>
                    <div className="mt-1 text-xs text-ink-300">{opt.note}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {STEPS[step] === 'experience' && (
            <div>
              <h2 className="font-display text-3xl font-bold">Where are you starting from?</h2>
              <p className="mt-2 text-sm text-ink-300">Honesty here means better placement — no ego, no judgment.</p>
              <div className="mt-6 flex flex-col gap-3">
                {EXP_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setExperience(opt.id)}
                    className={`card p-5 text-left transition-all ${
                      experience === opt.id ? 'border-volt-500/70 bg-volt-500/10' : ''
                    }`}
                  >
                    <div className="font-display text-lg font-semibold">{opt.label}</div>
                    <div className="mt-0.5 text-sm text-ink-300">{opt.note}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {STEPS[step] === 'baseline' && (
            <div>
              <h2 className="font-display text-3xl font-bold">Quick baseline</h2>
              <p className="mt-2 text-sm text-ink-300">
                Rough estimates are fine — the engine recalibrates after every session anyway.
              </p>

              <div className="card mt-6 p-5">
                <div className="flex items-baseline justify-between">
                  <label className="font-display font-semibold">Max push-ups in one set</label>
                  <span className="font-display text-2xl font-bold text-volt-400">{baseline.maxPushups}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={baseline.maxPushups}
                  onChange={(e) => setBaseline({ ...baseline, maxPushups: +e.target.value })}
                  className="mt-4"
                />
              </div>

              <div className="card mt-3 p-5">
                <div className="flex items-baseline justify-between">
                  <label className="font-display font-semibold">Dead hang from a bar</label>
                  <span className="font-display text-2xl font-bold text-volt-400">{baseline.hangSeconds}s</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={5}
                  value={baseline.hangSeconds}
                  onChange={(e) => setBaseline({ ...baseline, hangSeconds: +e.target.value })}
                  className="mt-4"
                />
              </div>

              <div className="card mt-3 p-5">
                <div className="flex items-baseline justify-between">
                  <label className="font-display font-semibold">Plank hold</label>
                  <span className="font-display text-2xl font-bold text-volt-400">{baseline.plankSeconds}s</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={5}
                  value={baseline.plankSeconds}
                  onChange={(e) => setBaseline({ ...baseline, plankSeconds: +e.target.value })}
                  className="mt-4"
                />
              </div>

              <div className="card mt-3 p-5">
                <label className="font-display font-semibold">Can you rest in a deep squat, heels down?</label>
                <div className="mt-3 flex gap-2">
                  {(['no', 'almost', 'yes'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setBaseline({ ...baseline, deepSquat: v })}
                      className={`flex-1 rounded-xl border px-3 py-2.5 font-display text-sm font-semibold capitalize transition-colors ${
                        baseline.deepSquat === v
                          ? 'border-volt-500/70 bg-volt-500/15 text-volt-300'
                          : 'border-ink-600 bg-ink-800 text-ink-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {STEPS[step] === 'goals' && (
            <div>
              <h2 className="font-display text-3xl font-bold">Pick your summits</h2>
              <p className="mt-2 text-sm text-ink-300">
                Choose the skills that light you up. Mobility rides along automatically — it unlocks
                everything else.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {PATHS.filter((p) => p.id !== 'mobility').map((path) => {
                  const active = goals.includes(path.id)
                  return (
                    <button
                      key={path.id}
                      onClick={() =>
                        setGoals((g) => (active ? g.filter((x) => x !== path.id) : [...g, path.id]))
                      }
                      className={`card p-3 text-left transition-all ${
                        active ? 'border-volt-500/70 bg-volt-500/10' : 'opacity-70'
                      }`}
                    >
                      <div className="h-16">
                        <PoseFigure poseId={path.poseId} accent={path.color} className="h-full w-full" glow={active} />
                      </div>
                      <div className="mt-2 font-display text-sm font-semibold leading-tight">{path.name}</div>
                      <div className="mt-0.5 text-[11px] text-ink-300">{path.goal}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {STEPS[step] === 'ready' && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="h-40 w-52"
              >
                <PoseFigure poseId="frontlever" accent="#bef264" className="h-full w-full" />
              </motion.div>
              <h2 className="mt-6 font-display text-3xl font-bold">
                Your journey begins, {name.trim() || 'Athlete'}.
              </h2>
              <p className="mt-3 max-w-sm text-ink-200">
                We placed you on {goals.length} paths at levels matching your baseline. Master each
                step twice and the next one unlocks. The mountain is tall — climb it one clean hold
                at a time.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="sticky bottom-0 bg-gradient-to-t from-ink-900 via-ink-900/95 to-transparent pb-8 pt-4">
        <button
          onClick={STEPS[step] === 'ready' ? finish : next}
          disabled={!canContinue}
          className="btn-primary w-full text-lg disabled:opacity-40"
        >
          {STEPS[step] === 'ready' ? 'Start Training' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
