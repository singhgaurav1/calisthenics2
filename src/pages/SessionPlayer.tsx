import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { EXERCISE_BY_ID } from '../data/exercises'
import { PATH_BY_ID } from '../data/paths'
import { pickStretch } from '../data/stretches'
import { scaleProtocol, logMeetsMastery } from '../engine/adaptive'
import { WARMUP_ITEMS } from '../engine/sessionBuilder'
import { PoseFigure } from '../components/PoseFigure'
import { TimerRing } from '../components/TimerRing'
import { sounds, vibrate } from '../lib/audio'
import { formatSeconds, todayISO } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import type { PlannedExercise, SetResult, Stretch } from '../types'

type Phase = 'intro' | 'prepare' | 'work' | 'switch' | 'log' | 'rest' | 'summary'
type Side = 'left' | 'right' | null

const PREPARE_SECONDS = 5
const SWITCH_SECONDS = 10

const RPE_OPTIONS = [
  { value: 6, label: 'Easy' },
  { value: 7, label: 'Solid' },
  { value: 8, label: 'Hard' },
  { value: 9.5, label: 'Max' },
]

export default function SessionPlayer() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const profile = useAppStore((s) => s.profile)
  const plan = useAppStore((s) => s.plan)
  const completeSession = useAppStore((s) => s.completeSession)
  const lastMastered = useAppStore((s) => s.lastMastered)

  const singleId = params.get('exercise')
  const planned: PlannedExercise[] = useMemo(() => {
    if (singleId && profile) {
      const ex = EXERCISE_BY_ID[singleId]
      if (ex) {
        const p = scaleProtocol(ex.protocol, profile.ageGroup)
        const st = useAppStore.getState().exerciseStates[ex.id]
        return [
          {
            exerciseId: ex.id,
            sets: p.sets,
            targetHold: ex.type !== 'dynamic' ? (st?.targetHold ?? p.holdMin) : undefined,
            targetReps: ex.type === 'dynamic' ? (st?.targetReps ?? p.repsMin) : undefined,
            restSeconds: p.restSeconds,
          },
        ]
      }
    }
    return plan?.exercises ?? []
  }, [singleId, plan, profile])

  const [phase, setPhase] = useState<Phase>('intro')
  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [side, setSide] = useState<Side>(null)
  const [results, setResults] = useState<SetResult[][]>(() => planned.map(() => []))
  const [startedAt] = useState(Date.now())

  // timing
  const [now, setNow] = useState(Date.now())
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [pausedRemaining, setPausedRemaining] = useState(0)
  const [phaseTotal, setPhaseTotal] = useState(0)

  // reps
  const [repCount, setRepCount] = useState(0)
  const [leftAchieved, setLeftAchieved] = useState<number | null>(null)

  // log form
  const [logAchieved, setLogAchieved] = useState(0)
  const [logRpe, setLogRpe] = useState(7)

  // rest stretch
  const [stretch, setStretch] = useState<Stretch | null>(null)

  const lastTickSecond = useRef(-1)
  const finishedRef = useRef(false)

  const pe = planned[exIdx] as PlannedExercise | undefined
  const ex = pe ? EXERCISE_BY_ID[pe.exerciseId] : undefined
  const path = ex ? PATH_BY_ID[ex.pathId] : undefined
  const isHold = ex ? ex.type !== 'dynamic' : false
  const perSide = ex ? (scaleProtocol(ex.protocol, profile?.ageGroup ?? 'adult').perSide ?? false) : false
  const target = pe ? (isHold ? (pe.targetHold ?? 15) : (pe.targetReps ?? 5)) : 0

  const soundOn = profile?.sound ?? true
  const vibeOn = profile?.vibration ?? true
  const play = useCallback(
    (fn: () => void) => {
      if (soundOn) fn()
    },
    [soundOn],
  )

  /* wake lock while training */
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    void (async () => {
      try {
        lock = (await navigator.wakeLock?.request('screen')) ?? null
      } catch {
        /* unsupported */
      }
    })()
    return () => void lock?.release().catch(() => {})
  }, [])

  /* master clock */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [])

  const remaining = endsAt !== null && !paused ? Math.max(0, (endsAt - now) / 1000) : pausedRemaining
  const remainingWhole = Math.ceil(remaining)

  const startTimer = useCallback((seconds: number) => {
    setPhaseTotal(seconds)
    setEndsAt(Date.now() + seconds * 1000)
    setPaused(false)
    setPausedRemaining(0)
    lastTickSecond.current = -1
  }, [])

  const stopTimer = useCallback(() => {
    setEndsAt(null)
    setPaused(false)
  }, [])

  /* countdown beeps */
  useEffect(() => {
    if (endsAt === null || paused) return
    if ((phase === 'prepare' || phase === 'work' || phase === 'switch') && remainingWhole <= 3 && remainingWhole >= 1) {
      if (lastTickSecond.current !== remainingWhole) {
        lastTickSecond.current = remainingWhole
        play(sounds.tick)
      }
    }
    if (phase === 'rest' && remainingWhole === 10 && lastTickSecond.current !== 10) {
      lastTickSecond.current = 10
      play(sounds.warn)
    }
  }, [remainingWhole, phase, endsAt, paused, play])

  /* ---------- phase transitions ---------- */

  const goPrepare = useCallback(
    (nextSide: Side) => {
      setSide(nextSide)
      setPhase('prepare')
      startTimer(PREPARE_SECONDS)
    },
    [startTimer],
  )

  const beginSet = useCallback(() => {
    setRepCount(0)
    setLeftAchieved(null)
    goPrepare(perSide ? 'left' : null)
  }, [goPrepare, perSide])

  const goWork = useCallback(() => {
    setPhase('work')
    play(sounds.go)
    if (vibeOn) vibrate(100)
    if (isHold) startTimer(target)
    else stopTimer()
  }, [isHold, target, startTimer, stopTimer, play, vibeOn])

  const goLog = useCallback(
    (achieved: number) => {
      stopTimer()
      setLogAchieved(Math.round(achieved))
      setLogRpe(7)
      setPhase('log')
      play(sounds.done)
      if (vibeOn) vibrate([80, 60, 80])
    },
    [stopTimer, play, vibeOn],
  )

  /** A work bout ended (hold finished/stopped early, or reps confirmed). */
  const finishWorkBout = useCallback(
    (achieved: number) => {
      if (perSide && side === 'left') {
        setLeftAchieved(achieved)
        setSide('right')
        setPhase('switch')
        startTimer(SWITCH_SECONDS)
        play(sounds.warn)
        return
      }
      const combined = perSide && leftAchieved !== null ? Math.min(leftAchieved, achieved) : achieved
      goLog(combined)
    },
    [perSide, side, leftAchieved, goLog, startTimer, play],
  )

  const finalize = useCallback(
    (allResults: SetResult[][]) => {
      if (finishedRef.current || !profile) return
      finishedRef.current = true
      stopTimer()
      const entries = planned
        .map((p, i) => ({
          exerciseId: p.exerciseId,
          sets: allResults[i],
          metMastery: logMeetsMastery(EXERCISE_BY_ID[p.exerciseId], allResults[i], profile.ageGroup),
        }))
        .filter((e) => e.sets.length > 0)
      completeSession({
        id: `s-${Date.now()}`,
        date: todayISO(),
        focus: singleId ? 'single' : (plan?.focusLabel ?? 'Session'),
        entries,
        durationSec: Math.round((Date.now() - startedAt) / 1000),
        completed: true,
      })
      setPhase('summary')
      play(sounds.fanfare)
      if (vibeOn) vibrate([100, 80, 100, 80, 200])
    },
    [planned, profile, completeSession, singleId, plan, startedAt, stopTimer, play, vibeOn],
  )

  const saveLog = useCallback(() => {
    if (!pe) return
    const result: SetResult = isHold
      ? { targetHold: target, achievedHold: logAchieved, rpe: logRpe }
      : { targetReps: target, achievedReps: logAchieved, rpe: logRpe }
    const nextResults = results.map((r, i) => (i === exIdx ? [...r, result] : r))
    setResults(nextResults)

    const moreSets = setIdx + 1 < pe.sets
    const moreExercises = exIdx + 1 < planned.length
    if (moreSets || moreExercises) {
      if (ex) setStretch(pickStretch(ex.loads, stretch?.id))
      setPhase('rest')
      startTimer(pe.restSeconds)
      if (!moreSets) {
        setExIdx((i) => i + 1)
        setSetIdx(0)
      } else {
        setSetIdx((i) => i + 1)
      }
    } else {
      finalize(nextResults)
    }
  }, [pe, ex, isHold, target, logAchieved, logRpe, results, exIdx, setIdx, planned.length, stretch, startTimer, finalize])

  /* auto-advance when timers hit zero */
  useEffect(() => {
    if (endsAt === null || paused || remaining > 0) return
    if (phase === 'prepare') goWork()
    else if (phase === 'work' && isHold) finishWorkBout(phaseTotal)
    else if (phase === 'switch') goWork()
    else if (phase === 'rest') {
      play(sounds.go)
      beginSet()
    }
  }, [remaining, endsAt, paused, phase, isHold, phaseTotal, goWork, finishWorkBout, beginSet, play])

  if (!profile || planned.length === 0 || !pe || !ex || !path) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-ink-200">No session planned. Head home to generate one.</p>
        <button onClick={() => navigate('/')} className="btn-primary px-8">
          Go home
        </button>
      </div>
    )
  }

  const exit = () => {
    if (phase === 'summary' || window.confirm('Leave this session? Progress from logged sets is kept only on finish.')) {
      navigate('/')
    }
  }

  const sideLabel = side === 'left' ? 'Left side' : side === 'right' ? 'Right side' : null

  /* ---------- render ---------- */

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pt-safe">
      {/* top bar */}
      <div className="flex items-center justify-between pt-5">
        <button onClick={exit} className="rounded-full bg-ink-800 p-2.5 text-ink-200" aria-label="Exit session">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        {phase !== 'intro' && phase !== 'summary' && (
          <div className="flex flex-col items-end">
            <p className="label-caps" style={{ color: path.color }}>
              {ex.name}
            </p>
            <div className="mt-1.5 flex gap-1.5">
              {Array.from({ length: pe.sets }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full ${
                    i < setIdx ? 'bg-volt-400' : i === setIdx ? 'bg-ink-300' : 'bg-ink-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${exIdx}-${setIdx}-${side}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.2 }}
          className="flex flex-1 flex-col pb-10"
        >
          {/* ---------- INTRO ---------- */}
          {phase === 'intro' && (
            <div className="flex flex-1 flex-col pt-6">
              <h1 className="font-display text-3xl font-bold">
                {singleId ? 'Focused practice' : (plan?.focusLabel ?? 'Session')}
              </h1>
              <p className="mt-1 text-sm text-ink-300">
                {planned.length} exercise{planned.length > 1 ? 's' : ''} · rests become stretches ·
                timers keep you honest
              </p>

              <div className="card mt-5 p-5">
                <p className="label-caps text-ember-400">Warm up first (2–3 min)</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {WARMUP_ITEMS.map((w, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink-200">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-ember-400" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                {planned.map((p, i) => {
                  const e = EXERCISE_BY_ID[p.exerciseId]
                  const c = PATH_BY_ID[e.pathId].color
                  return (
                    <div key={p.exerciseId} className="card flex items-center gap-3 p-3">
                      <span className="w-5 text-center font-display text-sm font-bold text-ink-400">{i + 1}</span>
                      <div className="h-12 w-14 shrink-0">
                        <PoseFigure poseId={e.poseId} accent={c} className="h-full w-full" glow={false} />
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-sm font-semibold">{e.name}</p>
                        <p className="text-xs text-ink-300">
                          {p.sets} × {p.targetHold !== undefined ? `${p.targetHold}s` : `${p.targetReps} reps`}
                          {scaleProtocol(e.protocol, profile.ageGroup).perSide ? ' / side' : ''} ·{' '}
                          {formatSeconds(p.restSeconds)} rest
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-auto pt-6">
                <button onClick={beginSet} className="btn-primary w-full text-lg">
                  I’m warm — begin
                </button>
              </div>
            </div>
          )}

          {/* ---------- PREPARE ---------- */}
          {phase === 'prepare' && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="label-caps">
                Set {setIdx + 1} of {pe.sets}
                {sideLabel ? ` · ${sideLabel}` : ''}
              </p>
              <div className="mt-4 h-36 w-48">
                <PoseFigure poseId={ex.poseId} accent={path.color} className="h-full w-full" />
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold">{ex.name}</h2>
              <p className="mt-2 max-w-xs text-sm text-ink-300">{ex.cues[0]}</p>
              <div className="mt-8 font-display text-7xl font-bold text-volt-400">{remainingWhole}</div>
              <p className="label-caps mt-2">Get ready</p>
            </div>
          )}

          {/* ---------- WORK: HOLD ---------- */}
          {phase === 'work' && isHold && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="label-caps">
                Set {setIdx + 1} of {pe.sets}
                {sideLabel ? ` · ${sideLabel}` : ''}
              </p>
              <div className="mt-6">
                <TimerRing progress={phaseTotal > 0 ? remaining / phaseTotal : 0} color={path.color} size={270}>
                  <div className="h-20 w-28">
                    <PoseFigure poseId={ex.poseId} accent={path.color} className="h-full w-full" glow={false} />
                  </div>
                  <div className="font-display text-6xl font-bold tabular-nums">{remainingWhole}</div>
                  <p className="label-caps mt-1">hold strong</p>
                </TimerRing>
              </div>
              <p className="mt-6 max-w-xs text-center text-sm text-ink-300">
                {ex.cues[(setIdx + (side === 'right' ? 1 : 0)) % ex.cues.length]}
              </p>
              <div className="mt-8 flex w-full gap-3">
                <button
                  onClick={() => {
                    if (paused) {
                      setEndsAt(Date.now() + pausedRemaining * 1000)
                      setPaused(false)
                    } else {
                      setPausedRemaining(remaining)
                      setPaused(true)
                    }
                  }}
                  className="btn-ghost flex-1"
                >
                  {paused ? 'Resume' : 'Pause'}
                </button>
                <button onClick={() => finishWorkBout(phaseTotal - remaining)} className="btn-ghost flex-1">
                  End hold
                </button>
              </div>
            </div>
          )}

          {/* ---------- WORK: REPS ---------- */}
          {phase === 'work' && !isHold && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="label-caps">
                Set {setIdx + 1} of {pe.sets}
                {sideLabel ? ` · ${sideLabel}` : ''}
              </p>
              <div className="mt-2 h-32 w-44">
                <PoseFigure poseId={ex.poseId} accent={path.color} className="h-full w-full" />
              </div>
              <button
                onClick={() => {
                  setRepCount((c) => c + 1)
                  play(sounds.tick)
                  if (vibeOn) vibrate(30)
                }}
                className="card-interactive mt-4 flex size-48 flex-col items-center justify-center rounded-full border-2"
                style={{ borderColor: path.color }}
              >
                <span className="font-display text-6xl font-bold tabular-nums">{repCount}</span>
                <span className="label-caps mt-1">of {target} · tap per rep</span>
              </button>
              {scaleProtocol(ex.protocol, profile.ageGroup).tempo && (
                <p className="mt-4 text-sm text-ink-300">Tempo: {scaleProtocol(ex.protocol, profile.ageGroup).tempo}</p>
              )}
              <p className="mt-2 max-w-xs text-center text-sm text-ink-300">{ex.cues[setIdx % ex.cues.length]}</p>
              <div className="mt-8 flex w-full gap-3">
                <button
                  onClick={() => setRepCount((c) => Math.max(0, c - 1))}
                  className="btn-ghost w-24"
                  aria-label="Undo rep"
                >
                  −1
                </button>
                <button onClick={() => finishWorkBout(repCount || target)} className="btn-primary flex-1">
                  Set done
                </button>
              </div>
            </div>
          )}

          {/* ---------- SWITCH SIDES ---------- */}
          {phase === 'switch' && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="h-32 w-44">
                <PoseFigure poseId={ex.poseId} accent={path.color} className="h-full w-full" />
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold">Switch sides</h2>
              <p className="mt-2 text-sm text-ink-300">Right side is up next — shake it out.</p>
              <div className="mt-6 font-display text-6xl font-bold text-volt-400">{remainingWhole}</div>
              <button onClick={goWork} className="btn-ghost mt-8 px-8">
                Ready now
              </button>
            </div>
          )}

          {/* ---------- LOG ---------- */}
          {phase === 'log' && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="label-caps">Log set {setIdx + 1}</p>
              <h2 className="mt-1 font-display text-2xl font-bold">{ex.name}</h2>

              <div className="card mt-6 w-full p-6">
                <p className="text-center text-sm text-ink-300">
                  {isHold ? 'Seconds held' : 'Reps completed'}
                  {perSide ? ' (weaker side)' : ''}
                </p>
                <div className="mt-3 flex items-center justify-center gap-6">
                  <button
                    onClick={() => setLogAchieved((v) => Math.max(0, v - 1))}
                    className="btn-ghost size-14 rounded-full p-0 text-2xl"
                  >
                    −
                  </button>
                  <span className="w-24 text-center font-display text-6xl font-bold tabular-nums">{logAchieved}</span>
                  <button
                    onClick={() => setLogAchieved((v) => v + 1)}
                    className="btn-ghost size-14 rounded-full p-0 text-2xl"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-center text-xs text-ink-400">Target was {target}</p>

                <p className="mt-6 text-center text-sm text-ink-300">How hard was that?</p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {RPE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setLogRpe(o.value)}
                      className={`rounded-xl border px-2 py-3 font-display text-sm font-semibold transition-colors ${
                        logRpe === o.value
                          ? 'border-volt-500/70 bg-volt-500/15 text-volt-300'
                          : 'border-ink-600 bg-ink-800 text-ink-200'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={saveLog} className="btn-primary mt-6 w-full text-lg">
                {setIdx + 1 < pe.sets || exIdx + 1 < planned.length ? 'Save · rest' : 'Save · finish'}
              </button>
            </div>
          )}

          {/* ---------- REST ---------- */}
          {phase === 'rest' && (
            <div className="flex flex-1 flex-col items-center pt-4">
              <TimerRing progress={phaseTotal > 0 ? remaining / phaseTotal : 0} color="#22d3ee" size={190} stroke={8}>
                <div className="font-display text-5xl font-bold tabular-nums">{formatSeconds(remainingWhole)}</div>
                <p className="label-caps mt-1">rest</p>
              </TimerRing>

              {stretch && (
                <div className="card mt-6 w-full p-5">
                  <p className="label-caps text-aqua-400">While you rest — stretch</p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-24 w-28 shrink-0 rounded-2xl bg-ink-800/80">
                      <PoseFigure poseId={stretch.poseId} accent="#22d3ee" className="h-full w-full" />
                    </div>
                    <div>
                      <p className="font-display font-semibold">{stretch.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-300">{stretch.cue}</p>
                      <p className="mt-1.5 text-[11px] font-medium text-aqua-400">
                        ~{stretch.holdSeconds}s{stretch.perSide ? ' per side' : ''} · easy intensity
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-4 text-sm text-ink-300">
                Up next: <span className="font-semibold text-ink-100">{EXERCISE_BY_ID[planned[exIdx].exerciseId].name}</span>
                {' · '}set {setIdx + 1} of {planned[exIdx].sets}
              </p>

              <div className="mt-auto flex w-full gap-3 pb-2 pt-6">
                <button
                  onClick={() => endsAt !== null && setEndsAt(endsAt + 30_000)}
                  className="btn-ghost flex-1"
                >
                  +30s
                </button>
                <button
                  onClick={() => {
                    play(sounds.go)
                    beginSet()
                  }}
                  className="btn-primary flex-1"
                >
                  Skip rest
                </button>
              </div>
            </div>
          )}

          {/* ---------- SUMMARY ---------- */}
          {phase === 'summary' && (
            <SummaryView
              planned={planned}
              results={results}
              durationSec={Math.round((Date.now() - startedAt) / 1000)}
              mastered={lastMastered}
              onDone={() => navigate('/')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function SummaryView({
  planned,
  results,
  durationSec,
  mastered,
  onDone,
}: {
  planned: PlannedExercise[]
  results: SetResult[][]
  durationSec: number
  mastered: string[]
  onDone: () => void
}) {
  return (
    <div className="flex flex-1 flex-col pt-8">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="mx-auto flex size-24 items-center justify-center rounded-full bg-volt-500/15"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#bef264" strokeWidth="2.5" className="size-12">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <h1 className="mt-5 text-center font-display text-3xl font-bold">Session complete</h1>
      <p className="mt-1 text-center text-sm text-ink-300">
        {formatSeconds(durationSec)} of focused work. Logged and adapting.
      </p>

      {mastered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mt-6 border-volt-500/40 bg-volt-500/10 p-5 text-center"
        >
          <p className="font-display text-lg font-bold text-volt-300">Level mastered! 🎉</p>
          {mastered.map((id) => (
            <p key={id} className="mt-1 text-sm text-ink-100">
              {EXERCISE_BY_ID[id]?.name} — the next challenge is unlocked.
            </p>
          ))}
        </motion.div>
      )}

      <div className="mt-6 flex flex-col gap-2.5">
        {planned.map((p, i) => {
          const e = EXERCISE_BY_ID[p.exerciseId]
          const sets = results[i]
          if (!sets || sets.length === 0) return null
          const isHold = e.type !== 'dynamic'
          const vals = sets.map((s) => (isHold ? (s.achievedHold ?? 0) : (s.achievedReps ?? 0)))
          return (
            <div key={p.exerciseId} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-display text-sm font-semibold">{e.name}</p>
                <p className="mt-0.5 text-xs text-ink-300">
                  {vals.map((v) => `${v}${isHold ? 's' : ''}`).join(' · ')}
                </p>
              </div>
              <span className="chip">{sets.length} sets</span>
            </div>
          )
        })}
      </div>

      <div className="mt-auto pb-4 pt-6">
        <button onClick={onDone} className="btn-primary w-full text-lg">
          Done
        </button>
      </div>
    </div>
  )
}
