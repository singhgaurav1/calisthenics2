import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AgeGroup,
  Experience,
  ExerciseState,
  Profile,
  SessionLog,
  SessionPlan,
} from '../types'
import { EXERCISES, EXERCISE_BY_ID, exercisesForPath } from '../data/exercises'
import { PATHS } from '../data/paths'
import { adaptAfterSession, initialState } from '../engine/adaptive'
import { buildSession } from '../engine/sessionBuilder'
import { todayISO } from '../lib/dates'

export interface BaselineAnswers {
  maxPushups: number
  hangSeconds: number
  plankSeconds: number
  deepSquat: 'no' | 'almost' | 'yes'
}

/** Placement: map baseline answers to a starting level per path. */
function placementLevels(b: BaselineAnswers, exp: Experience): Record<string, number> {
  const bump = exp === 'consistent' ? 1 : 0
  const levels: Record<string, number> = {
    handstand: 1,
    hspu: b.maxPushups >= 12 ? 1 + bump : 1,
    planche: b.plankSeconds >= 45 ? 2 : 1,
    frontlever: b.plankSeconds >= 45 ? 2 : 1,
    flag: b.plankSeconds >= 60 ? 2 : 1,
    pull: b.hangSeconds >= 45 ? 3 : b.hangSeconds >= 20 ? 2 : 1,
    pushup: b.maxPushups >= 15 ? 3 : b.maxPushups >= 6 ? 2 : 1,
    squat: b.deepSquat === 'yes' ? 3 : b.deepSquat === 'almost' ? 2 : 1,
    mobility: 1,
  }
  if (exp === 'consistent') {
    levels.pull = Math.min(levels.pull + 1, 5)
    levels.pushup = Math.min(levels.pushup + 1, 4)
  }
  return levels
}

interface AppState {
  profile: Profile | null
  exerciseStates: Record<string, ExerciseState>
  sessionLogs: SessionLog[]
  plan: SessionPlan | null
  planDate: string | null
  planCompleted: boolean
  /** Exercise ids the engine currently flags for a step back. */
  regressionFlags: string[]
  /** Exercise ids mastered in the most recent session (for celebration). */
  lastMastered: string[]

  completeOnboarding: (
    data: { name: string; ageGroup: AgeGroup; experience: Experience; goals: string[] },
    baseline: BaselineAnswers,
  ) => void
  ensurePlan: () => void
  regeneratePlan: () => void
  completeSession: (log: SessionLog) => void
  updateProfile: (patch: Partial<Profile>) => void
  resetAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      exerciseStates: {},
      sessionLogs: [],
      plan: null,
      planDate: null,
      planCompleted: false,
      regressionFlags: [],
      lastMastered: [],

      completeOnboarding: (data, baseline) => {
        const profile: Profile = {
          name: data.name,
          ageGroup: data.ageGroup,
          experience: data.experience,
          goals: [...new Set([...data.goals, 'mobility'])],
          createdAt: new Date().toISOString(),
          sound: true,
          vibration: true,
        }
        const levels = placementLevels(baseline, data.experience)
        const states: Record<string, ExerciseState> = {}
        for (const path of PATHS) {
          const startLevel = levels[path.id] ?? 1
          for (const ex of exercisesForPath(path.id)) {
            if (ex.level < startLevel) {
              // Placed past this step: mark it complete so the map reads true.
              states[ex.id] = { ...initialState(ex, profile.ageGroup), mastered: true }
            } else if (ex.level === startLevel) {
              states[ex.id] = initialState(ex, profile.ageGroup)
            }
          }
        }
        set({ profile, exerciseStates: states, plan: null, planDate: null, planCompleted: false })
        get().ensurePlan()
      },

      ensurePlan: () => {
        const { profile, plan, planDate, exerciseStates, sessionLogs } = get()
        if (!profile) return
        const today = todayISO()
        if (plan && planDate === today) return
        set({
          plan: buildSession(profile, exerciseStates, sessionLogs.filter((l) => l.completed).length),
          planDate: today,
          planCompleted: false,
        })
      },

      regeneratePlan: () => {
        const { profile, exerciseStates, sessionLogs } = get()
        if (!profile) return
        set({
          plan: buildSession(profile, exerciseStates, sessionLogs.filter((l) => l.completed).length),
          planDate: todayISO(),
          planCompleted: false,
        })
      },

      completeSession: (log) => {
        const { profile, exerciseStates } = get()
        if (!profile) return
        const states = { ...exerciseStates }
        const flags: string[] = []
        const masteredNow: string[] = []

        for (const entry of log.entries) {
          const ex = EXERCISE_BY_ID[entry.exerciseId]
          if (!ex) continue
          const prev = states[ex.id] ?? initialState(ex, profile.ageGroup)
          const result = adaptAfterSession(ex, prev, entry, profile.ageGroup)
          states[ex.id] = result.state
          if (result.suggestRegression) flags.push(ex.id)
          if (result.masteredNow) {
            masteredNow.push(ex.id)
            // Unlock the next level of this path.
            const next = EXERCISES.find((e) => e.pathId === ex.pathId && e.level === ex.level + 1)
            if (next && !states[next.id]) {
              states[next.id] = initialState(next, profile.ageGroup)
            }
          }
        }

        set((s) => ({
          exerciseStates: states,
          sessionLogs: [...s.sessionLogs, log],
          regressionFlags: flags,
          lastMastered: masteredNow,
          planCompleted: true,
        }))
      },

      updateProfile: (patch) =>
        set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : s)),

      resetAll: () =>
        set({
          profile: null,
          exerciseStates: {},
          sessionLogs: [],
          plan: null,
          planDate: null,
          planCompleted: false,
          regressionFlags: [],
          lastMastered: [],
        }),
    }),
    { name: 'ascend-store-v1' },
  ),
)

/* ---------- derived selectors ---------- */

export function computeStreak(logs: SessionLog[]): number {
  const days = [...new Set(logs.filter((l) => l.completed).map((l) => l.date))].sort().reverse()
  if (days.length === 0) return 0
  const MS = 86400000
  const today = new Date(todayISO()).getTime()
  const gapToToday = Math.round((today - new Date(days[0]).getTime()) / MS)
  // A rest day never breaks a streak; two idle days do.
  if (gapToToday > 2) return 0
  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const gap = Math.round((new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / MS)
    if (gap <= 2) streak++
    else break
  }
  return streak
}

export function pathProgress(pathId: string, states: Record<string, ExerciseState>): number {
  const list = exercisesForPath(pathId)
  if (list.length === 0) return 0
  const mastered = list.filter((e) => states[e.id]?.mastered).length
  return mastered / list.length
}

const RANKS = ['Rookie', 'Mover', 'Athlete', 'Beast', 'Master of Gravity'] as const

export function rankFor(states: Record<string, ExerciseState>): string {
  const mastered = Object.values(states).filter((s) => s.mastered).length
  if (mastered >= 45) return RANKS[4]
  if (mastered >= 30) return RANKS[3]
  if (mastered >= 16) return RANKS[2]
  if (mastered >= 6) return RANKS[1]
  return RANKS[0]
}
