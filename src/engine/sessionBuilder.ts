import { EXERCISES, exercisesForPath } from '../data/exercises'
import type {
  AgeGroup,
  Exercise,
  ExerciseState,
  PlannedExercise,
  Profile,
  SessionPlan,
} from '../types'
import { scaleProtocol } from './adaptive'

/**
 * Focus rotation. Skill work (handstands) thrives on frequency, so it appears
 * both on its own day and as a light opener on push days.
 */
const ROTATION = [
  { focus: 'push', label: 'Push Strength', pathIds: ['hspu', 'planche', 'pushup'] },
  { focus: 'pull', label: 'Pull Strength', pathIds: ['pull', 'frontlever', 'flag'] },
  { focus: 'legs', label: 'Legs & Flow', pathIds: ['squat'] },
  { focus: 'skill', label: 'Skill & Balance', pathIds: ['handstand'] },
] as const

/** The current (lowest unmastered available) exercise of a path. */
export function currentExerciseOfPath(
  pathId: string,
  states: Record<string, ExerciseState>,
): Exercise | undefined {
  const list = exercisesForPath(pathId)
  const active = list.find((e) => {
    const s = states[e.id]
    return s !== undefined && !s.mastered
  })
  // All mastered (or none unlocked yet): fall back to hardest unlocked.
  if (active) return active
  const unlocked = list.filter((e) => states[e.id] !== undefined)
  return unlocked[unlocked.length - 1]
}

function toPlanned(ex: Exercise, states: Record<string, ExerciseState>, age: AgeGroup): PlannedExercise {
  const p = scaleProtocol(ex.protocol, age)
  const s = states[ex.id]
  return {
    exerciseId: ex.id,
    sets: p.sets,
    targetHold: ex.type !== 'dynamic' ? (s?.targetHold ?? p.holdMin) : undefined,
    targetReps: ex.type === 'dynamic' ? (s?.targetReps ?? p.repsMin) : undefined,
    restSeconds: p.restSeconds,
  }
}

/**
 * Build today's adaptive session:
 * - rotate focus (push / pull / legs / skill) by completed session count
 * - pick each goal path's current exercise
 * - open push/skill days with handstand practice (frequency wins for balance)
 * - close every session with the current mobility step
 */
export function buildSession(
  profile: Profile,
  states: Record<string, ExerciseState>,
  completedSessions: number,
): SessionPlan {
  const rotationPool = ROTATION.filter((r) =>
    r.focus === 'skill' ? true : r.pathIds.some((p) => profile.goals.includes(p)),
  )
  const rot = rotationPool[completedSessions % rotationPool.length]

  const maxMain = profile.ageGroup === 'kid' ? 2 : 3
  const picks: Exercise[] = []

  // Handstand practice leads skill days and push days (short, fresh, frequent).
  if ((rot.focus === 'skill' || rot.focus === 'push') && profile.goals.includes('handstand')) {
    const hs = currentExerciseOfPath('handstand', states)
    if (hs) picks.push(hs)
  }

  for (const pathId of rot.pathIds) {
    if (pathId === 'handstand') continue
    if (!profile.goals.includes(pathId)) continue
    const ex = currentExerciseOfPath(pathId, states)
    if (ex && !picks.some((p) => p.id === ex.id)) picks.push(ex)
    if (picks.length >= maxMain) break
  }

  // Leg days get core support work (hollow body feeds every skill).
  if (rot.focus === 'legs' && picks.length < maxMain + 1) {
    const hollow = EXERCISES.find((e) => e.id === 'fl-hollow')
    if (hollow && states[hollow.id] && !states[hollow.id].mastered) picks.push(hollow)
  }

  // Every session closes with the current mobility step.
  const mob = currentExerciseOfPath('mobility', states)
  if (mob && !picks.some((p) => p.id === mob.id)) picks.push(mob)

  return {
    focus: rot.focus,
    focusLabel: rot.label,
    exercises: picks.map((e) => toPlanned(e, states, profile.ageGroup)),
  }
}

/** Warm-up checklist shown before every session (not timed). */
export const WARMUP_ITEMS = [
  '60s easy movement — jog in place, jumping jacks or skipping',
  'Arm circles & shoulder rolls — 10 each direction',
  'Wrist rocks on all fours — 20s each direction',
  '5 deep bodyweight squats + 5 easy push-ups',
]
