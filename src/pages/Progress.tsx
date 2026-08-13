import { useMemo } from 'react'
import { useAppStore, computeStreak, pathProgress, rankFor } from '../store/useAppStore'
import { PATHS } from '../data/paths'
import { EXERCISE_BY_ID } from '../data/exercises'
import { formatSeconds, lastNDays } from '../lib/dates'

export default function Progress() {
  const logs = useAppStore((s) => s.sessionLogs)
  const states = useAppStore((s) => s.exerciseStates)
  const profile = useAppStore((s) => s.profile)

  const completed = logs.filter((l) => l.completed)
  const streak = useMemo(() => computeStreak(logs), [logs])
  const totalMinutes = Math.round(completed.reduce((a, l) => a + l.durationSec, 0) / 60)
  const masteredCount = Object.values(states).filter((s) => s.mastered).length

  const bests = useMemo(() => {
    return Object.values(states)
      .filter((s) => (s.bestHold ?? 0) > 0 || (s.bestReps ?? 0) > 0)
      .map((s) => ({
        name: EXERCISE_BY_ID[s.exerciseId]?.name ?? s.exerciseId,
        value: s.bestHold ? `${s.bestHold}s` : `${s.bestReps} reps`,
        raw: s.bestHold ?? s.bestReps ?? 0,
        isHold: (s.bestHold ?? 0) > 0,
      }))
      .sort((a, b) => b.raw - a.raw)
      .slice(0, 6)
  }, [states])

  const activity = useMemo(() => {
    const byDate = new Map<string, number>()
    for (const l of completed) byDate.set(l.date, (byDate.get(l.date) ?? 0) + l.durationSec)
    return lastNDays(28).map((d) => ({ date: d, sec: byDate.get(d) ?? 0 }))
  }, [completed])
  const maxSec = Math.max(60, ...activity.map((a) => a.sec))

  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-safe">
      <header className="pt-8">
        <h1 className="font-display text-3xl font-bold">Progress</h1>
        <p className="mt-1 text-sm text-ink-300">Current rank: {rankFor(states)}</p>
      </header>

      {/* stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { label: 'Day streak', value: String(streak) },
          { label: 'Sessions', value: String(completed.length) },
          { label: 'Minutes trained', value: String(totalMinutes) },
          { label: 'Levels mastered', value: String(masteredCount) },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="font-display text-3xl font-bold text-volt-400">{s.value}</p>
            <p className="mt-1 text-xs font-medium text-ink-300">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 28-day activity */}
      <section className="card mt-6 p-5">
        <p className="label-caps">Last 4 weeks</p>
        <div className="mt-4 flex h-24 items-end gap-1">
          {activity.map((a) => (
            <div key={a.date} className="flex-1">
              <div
                className={`w-full rounded-sm ${a.sec > 0 ? 'bg-volt-400' : 'bg-ink-700'}`}
                style={{ height: `${Math.max(6, (a.sec / maxSec) * 96)}px` }}
                title={`${a.date}: ${formatSeconds(a.sec)}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* per-path bars */}
      <section className="card mt-4 p-5">
        <p className="label-caps">Path completion</p>
        <div className="mt-4 flex flex-col gap-3.5">
          {PATHS.filter((p) => profile?.goals.includes(p.id)).map((p) => {
            const prog = pathProgress(p.id, states)
            return (
              <div key={p.id}>
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-ink-200">{p.name}</span>
                  <span className="font-display font-bold" style={{ color: p.color }}>
                    {Math.round(prog * 100)}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${prog * 100}%`, background: p.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* personal bests */}
      {bests.length > 0 && (
        <section className="card mt-4 p-5">
          <p className="label-caps">Personal bests</p>
          <div className="mt-3 flex flex-col gap-2">
            {bests.map((b) => (
              <div key={b.name} className="flex items-center justify-between rounded-xl bg-ink-800/70 px-4 py-3">
                <span className="text-sm font-medium text-ink-100">{b.name}</span>
                <span className="font-display font-bold text-volt-400">{b.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* recent sessions */}
      {completed.length > 0 && (
        <section className="mt-4">
          <p className="label-caps px-1">Recent sessions</p>
          <div className="mt-2 flex flex-col gap-2">
            {[...completed]
              .reverse()
              .slice(0, 8)
              .map((l) => (
                <div key={l.id} className="card flex items-center justify-between p-4">
                  <div>
                    <p className="font-display text-sm font-semibold">{l.focus}</p>
                    <p className="mt-0.5 text-xs text-ink-300">
                      {l.date} · {l.entries.length} exercises
                    </p>
                  </div>
                  <span className="chip">{formatSeconds(l.durationSec)}</span>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
