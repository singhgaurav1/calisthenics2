/** Core domain types for Ascend. */

export type AgeGroup = 'kid' | 'teen' | 'adult' | 'master'
export type Experience = 'new' | 'casual' | 'consistent'

export type PathCategory = 'push' | 'pull' | 'legs' | 'skill' | 'mobility'

export type ExerciseType = 'isometric' | 'dynamic' | 'mobility'

export interface Protocol {
  /** Working sets at standard (adult) scaling. */
  sets: number
  /** Isometric / mobility hold range in seconds. */
  holdMin?: number
  holdMax?: number
  /** Dynamic rep range. */
  repsMin?: number
  repsMax?: number
  /** Per-side exercise (unilateral). */
  perSide?: boolean
  /** Rest between sets, seconds. */
  restSeconds: number
  /** Suggested tempo, e.g. "3s down · 1s pause · press up". */
  tempo?: string
}

export interface MasteryCriteria {
  sets: number
  holdSeconds?: number
  reps?: number
  /** Sessions in a row meeting criteria required to unlock the next level. */
  sessions: number
}

export interface Exercise {
  id: string
  pathId: string
  /** 1-based level inside its path. */
  level: number
  name: string
  type: ExerciseType
  poseId: string
  /** One-line summary shown on cards. */
  summary: string
  /** Why this step matters on the road to the goal skill. */
  why: string
  /** Care-abouts: technique cues to actively think about. */
  cues: string[]
  /** Common pitfalls that stall progress or cause tweaks. */
  pitfalls: string[]
  protocol: Protocol
  mastery: MasteryCriteria
  masteryLabel: string
  /** Short evidence note behind the prescription. */
  science: string
  /** Optional extra guidance for the 8–12 age group. */
  youthNote?: string
  /** Body regions loaded — used to pick rest-filler stretches. */
  loads: BodyRegion[]
}

export type BodyRegion =
  | 'wrists'
  | 'shoulders'
  | 'chest'
  | 'lats'
  | 'core'
  | 'hips'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'spine'
  | 'forearms'

export interface SkillPath {
  id: string
  name: string
  goal: string
  tagline: string
  category: PathCategory
  color: string
  /** Pose used as the path emblem. */
  poseId: string
}

export interface Stretch {
  id: string
  name: string
  poseId: string
  cue: string
  /** Regions this stretch relieves / opens. */
  targets: BodyRegion[]
  holdSeconds: number
  perSide?: boolean
}

/* ---------- user + progress ---------- */

export interface Profile {
  name: string
  ageGroup: AgeGroup
  experience: Experience
  /** Chosen goal path ids (mobility is always included). */
  goals: string[]
  createdAt: string
  sound: boolean
  vibration: boolean
}

export interface SetResult {
  targetReps?: number
  targetHold?: number
  achievedReps?: number
  achievedHold?: number
  rpe?: number
}

export interface ExerciseSessionLog {
  exerciseId: string
  sets: SetResult[]
  /** Did this session meet the exercise's mastery criteria? */
  metMastery: boolean
}

export interface SessionLog {
  id: string
  date: string
  focus: string
  entries: ExerciseSessionLog[]
  durationSec: number
  completed: boolean
}

export interface ExerciseState {
  exerciseId: string
  /** Number of consecutive sessions meeting mastery criteria. */
  masteryStreak: number
  /** Consecutive sessions well below target — triggers regression advice. */
  struggleStreak: number
  mastered: boolean
  bestHold?: number
  bestReps?: number
  /** Adaptive working target for the next session. */
  targetHold?: number
  targetReps?: number
  lastPerformed?: string
  timesPerformed: number
}

/* ---------- live session plan ---------- */

export interface PlannedExercise {
  exerciseId: string
  sets: number
  targetHold?: number
  targetReps?: number
  restSeconds: number
}

export interface SessionPlan {
  focus: string
  focusLabel: string
  exercises: PlannedExercise[]
}
