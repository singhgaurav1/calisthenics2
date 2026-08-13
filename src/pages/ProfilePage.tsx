import { Link, useNavigate } from 'react-router-dom'
import { PATHS } from '../data/paths'
import { useAppStore, rankFor } from '../store/useAppStore'
import type { AgeGroup } from '../types'

const AGE_LABELS: Record<AgeGroup, string> = {
  kid: 'Young Athlete (8–12)',
  teen: 'Teen (13–17)',
  adult: 'Adult (18–29)',
  master: 'Prime (30–40)',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const profile = useAppStore((s) => s.profile)
  const states = useAppStore((s) => s.exerciseStates)
  const updateProfile = useAppStore((s) => s.updateProfile)
  const regeneratePlan = useAppStore((s) => s.regeneratePlan)
  const resetAll = useAppStore((s) => s.resetAll)

  if (!profile) return null

  const toggleGoal = (id: string) => {
    const has = profile.goals.includes(id)
    const goals = has ? profile.goals.filter((g) => g !== id) : [...profile.goals, id]
    if (goals.filter((g) => g !== 'mobility').length === 0) return
    updateProfile({ goals })
    regeneratePlan()
  }

  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-safe">
      <header className="pt-8">
        <h1 className="font-display text-3xl font-bold">{profile.name}</h1>
        <p className="mt-1 text-sm text-ink-300">
          {AGE_LABELS[profile.ageGroup]} · {rankFor(states)}
        </p>
      </header>

      {/* age group */}
      <section className="card mt-6 p-5">
        <p className="label-caps">Age group</p>
        <p className="mt-1 text-xs text-ink-400">
          Changes set counts, hold caps and rest lengths to match the evidence for your age.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(Object.keys(AGE_LABELS) as AgeGroup[]).map((ag) => (
            <button
              key={ag}
              onClick={() => {
                updateProfile({ ageGroup: ag })
                regeneratePlan()
              }}
              className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                profile.ageGroup === ag
                  ? 'border-volt-500/70 bg-volt-500/15 text-volt-300'
                  : 'border-ink-600 bg-ink-800 text-ink-200'
              }`}
            >
              {AGE_LABELS[ag]}
            </button>
          ))}
        </div>
      </section>

      {/* goals */}
      <section className="card mt-4 p-5">
        <p className="label-caps">Goal skills</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PATHS.filter((p) => p.id !== 'mobility').map((p) => {
            const active = profile.goals.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() => toggleGoal(p.id)}
                className={`chip transition-colors ${active ? 'border-volt-500/60 bg-volt-500/10 text-volt-300' : 'opacity-55'}`}
              >
                {p.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* toggles */}
      <section className="card mt-4 p-5">
        <p className="label-caps">Session cues</p>
        {(
          [
            { key: 'sound', label: 'Sound cues', desc: 'Countdown ticks, go & done chimes' },
            { key: 'vibration', label: 'Vibration', desc: 'Haptic pulses on phase changes' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => updateProfile({ [t.key]: !profile[t.key] } as Partial<typeof profile>)}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-ink-800/70 px-4 py-3.5"
          >
            <span className="text-left">
              <span className="block text-sm font-semibold text-ink-100">{t.label}</span>
              <span className="block text-xs text-ink-400">{t.desc}</span>
            </span>
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${profile[t.key] ? 'bg-volt-500' : 'bg-ink-600'}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${profile[t.key] ? 'left-[22px]' : 'left-0.5'}`}
              />
            </span>
          </button>
        ))}
      </section>

      <Link to="/method" className="card-interactive mt-4 flex items-center justify-between p-5">
        <div>
          <p className="font-display font-semibold">The Method</p>
          <p className="mt-0.5 text-xs text-ink-300">The science behind your programming</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-ink-400">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <button
        onClick={() => {
          if (window.confirm('Reset all progress and start over? This cannot be undone.')) {
            resetAll()
            navigate('/onboarding', { replace: true })
          }
        }}
        className="btn-ghost mt-6 w-full border-rose-450/30 text-rose-450"
      >
        Reset everything
      </button>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-400">
        Ascend is an educational training companion, not medical advice. Train on safe surfaces,
        warm up, and see a professional for pain that persists. Young athletes: train with adult
        supervision.
      </p>
    </div>
  )
}
