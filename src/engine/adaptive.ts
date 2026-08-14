import type {
  AgeGroup,
  Exercise,
  ExerciseSessionLog,
  ExerciseState,
  Protocol,
  SetResult,
} from '../types'

/**
 * Age-aware protocol scaling.
 * Youth guidance (Lloyd 2014; Faigenbaum 2009): technique first, moderate
 * volumes, no maximal grinds. Kids get fewer sets, capped holds and shorter
 * rests (children recover faster between efforts than adults).
 */
export function scaleProtocol(p: Protocol, age: AgeGroup): Protocol {
  if (age === 'kid') {
    return {
      ...p,
      sets: Math.max(2, p.sets - 1),
      holdMin: p.holdMin,
      holdMax: p.holdMax !== undefined ? Math.min(p.holdMax, 30) : undefined,
      repsMax: p.repsMax !== undefined ? Math.min(p.repsMax, 12) : undefined,
      restSeconds: Math.max(30, Math.round(p.restSeconds * 0.75)),
    }
  }
  if (age === 'teen') {
    return {
      ...p,
      holdMax: p.holdMax !== undefined ? Math.min(p.holdMax, 45) : undefined,
    }
  }
  return p
}

/** Scaled mastery volume (kids progress on ~75% of the adult standard). */
export function scaledMastery(ex: Exercise, age: AgeGroup): { holdSeconds?: number; reps?: number; sets: number } {
  const m = ex.mastery
  if (age === 'kid') {
    return {
      sets: Math.max(2, m.sets - 1),
      holdSeconds: m.holdSeconds !== undefined ? Math.max(5, Math.round(m.holdSeconds * 0.75)) : undefined,
      reps: m.reps !== undefined ? Math.max(2, Math.round(m.reps * 0.75)) : undefined,
    }
  }
  return { sets: m.sets, holdSeconds: m.holdSeconds, reps: m.reps }
}

export function initialState(ex: Exercise, age: AgeGroup): ExerciseState {
  const p = scaleProtocol(ex.protocol, age)
  return {
    exerciseId: ex.id,
    masteryStreak: 0,
    struggleStreak: 0,
    mastered: false,
    targetHold: p.holdMin,
    targetReps: p.repsMin,
    timesPerformed: 0,
  }
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

export interface AdaptResult {
  state: ExerciseState
  masteredNow: boolean
  suggestRegression: boolean
}

/**
 * Core adaptive rule set, applied after each logged exercise:
 * - Targets ratchet toward what you actually achieved (+small increment),
 *   clamped to the protocol range.
 * - Meeting the mastery standard in `mastery.sessions` separate sessions
 *   unlocks the next level.
 * - Two consecutive sessions well below target (<60%) suggest regression.
 */
export function adaptAfterSession(
  ex: Exercise,
  prev: ExerciseState,
  log: ExerciseSessionLog,
  age: AgeGroup,
): AdaptResult {
  const p = scaleProtocol(ex.protocol, age)
  const m = scaledMastery(ex, age)
  const isHold = ex.type !== 'dynamic'

  const achieved = log.sets
    .map((s: SetResult) => (isHold ? (s.achievedHold ?? 0) : (s.achievedReps ?? 0)))
    .filter((v) => v > 0)

  const best = Math.max(0, ...achieved)
  const typical = median(achieved)
  const rpes = log.sets.map((s) => s.rpe ?? 7)
  const typicalRpe = median(rpes)

  const target = isHold ? (prev.targetHold ?? p.holdMin ?? 10) : (prev.targetReps ?? p.repsMin ?? 5)
  const max = isHold ? (p.holdMax ?? 60) : (p.repsMax ?? 15)
  const min = isHold ? (p.holdMin ?? 5) : (p.repsMin ?? 3)

  // --- mastery check ---
  const masteryValue = isHold ? m.holdSeconds : m.reps
  const setsMeeting = log.sets.filter((s) => {
    const v = isHold ? (s.achievedHold ?? 0) : (s.achievedReps ?? 0)
    return masteryValue !== undefined && v >= masteryValue
  }).length
  const metMastery = masteryValue !== undefined && setsMeeting >= m.sets

  // --- struggle check ---
  const struggled = typical > 0 ? typical < 0.6 * target : true

  // --- target adjustment ---
  let nextTarget = target
  if (typical >= target && typicalRpe <= 8) {
    const increment = isHold ? (target < 15 ? 2 : 5) : 1
    nextTarget = Math.min(max, Math.max(typical, target) + increment)
  } else if (struggled) {
    nextTarget = Math.max(min, Math.round(target * 0.85))
  }

  const masteryStreak = metMastery ? prev.masteryStreak + 1 : 0
  const struggleStreak = struggled ? prev.struggleStreak + 1 : 0
  const masteredNow = !prev.mastered && masteryStreak >= ex.mastery.sessions

  const state: ExerciseState = {
    ...prev,
    masteryStreak,
    struggleStreak,
    mastered: prev.mastered || masteredNow,
    bestHold: isHold ? Math.max(prev.bestHold ?? 0, best) : prev.bestHold,
    bestReps: !isHold ? Math.max(prev.bestReps ?? 0, best) : prev.bestReps,
    targetHold: isHold ? nextTarget : prev.targetHold,
    targetReps: !isHold ? nextTarget : prev.targetReps,
    lastPerformed: new Date().toISOString().slice(0, 10),
    timesPerformed: prev.timesPerformed + 1,
  }

  return { state, masteredNow, suggestRegression: struggleStreak >= 2 }
}

/** Does a single exercise log meet the (age-scaled) mastery standard? */
export function logMeetsMastery(ex: Exercise, sets: SetResult[], age: AgeGroup): boolean {
  const m = scaledMastery(ex, age)
  const isHold = ex.type !== 'dynamic'
  const masteryValue = isHold ? m.holdSeconds : m.reps
  if (masteryValue === undefined) return false
  const meeting = sets.filter((s) => {
    const v = isHold ? (s.achievedHold ?? 0) : (s.achievedReps ?? 0)
    return v >= masteryValue
  }).length
  return meeting >= m.sets
}
