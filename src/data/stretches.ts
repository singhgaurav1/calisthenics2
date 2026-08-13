import type { BodyRegion, Stretch } from '../types'

/**
 * Rest-filler stretches. During rest timers the app picks a stretch that
 * relieves the regions the current exercise just loaded (or a gentle
 * antagonist opener), following evidence that 20–30s of easy inter-set
 * stretching is safe and productive use of rest (Behm 2016).
 */
export const STRETCHES: Stretch[] = [
  {
    id: 'st-wrist-flexor',
    name: 'Wrist Flexor Stretch',
    poseId: 'wristflexstretch',
    cue: 'Fingers toward knees, rock gently back until the forearms sing.',
    targets: ['wrists', 'forearms'],
    holdSeconds: 25,
  },
  {
    id: 'st-childpose',
    name: 'Puppy Reach',
    poseId: 'puppypose',
    cue: 'Knees under hips, arms long, melt the chest to the floor and breathe.',
    targets: ['lats', 'shoulders', 'spine'],
    holdSeconds: 30,
  },
  {
    id: 'st-doorway-pec',
    name: 'Wall Pec Opener',
    poseId: 'doorwaypec',
    cue: 'Arm on the wall behind you, step through gently, chest opens.',
    targets: ['chest', 'shoulders'],
    holdSeconds: 25,
    perSide: true,
  },
  {
    id: 'st-thread-needle',
    name: 'Thread the Needle',
    poseId: 'threadneedle',
    cue: 'From all fours, slide one arm under and across; upper back rotates.',
    targets: ['spine', 'shoulders', 'lats'],
    holdSeconds: 25,
    perSide: true,
  },
  {
    id: 'st-catcow',
    name: 'Cat-Cow Waves',
    poseId: 'catcow',
    cue: 'Slow waves: round the spine tall, then arch it long. Move with breath.',
    targets: ['spine', 'core'],
    holdSeconds: 30,
  },
  {
    id: 'st-forward-fold',
    name: 'Standing Forward Fold',
    poseId: 'forwardfold',
    cue: 'Hinge and hang heavy. Soft knees, heavy head, long hamstrings.',
    targets: ['hamstrings', 'spine'],
    holdSeconds: 30,
  },
  {
    id: 'st-hip-flexor',
    name: 'Half-Kneeling Hip Opener',
    poseId: 'hipflexor',
    cue: 'Rear knee down, squeeze that glute, reach tall — front of hip lengthens.',
    targets: ['hips', 'quads'],
    holdSeconds: 30,
    perSide: true,
  },
  {
    id: 'st-pigeon',
    name: 'Pigeon Stretch',
    poseId: 'pigeon',
    cue: 'Front shin across, back leg long, fold only as deep as breath stays easy.',
    targets: ['glutes', 'hips'],
    holdSeconds: 30,
    perSide: true,
  },
  {
    id: 'st-9090',
    name: '90/90 Sit',
    poseId: 'ninetyninety',
    cue: 'Both knees at right angles, sit tall, lean gently over the front shin.',
    targets: ['hips', 'glutes'],
    holdSeconds: 30,
    perSide: true,
  },
  {
    id: 'st-crossbody',
    name: 'Cross-Body Shoulder Stretch',
    poseId: 'crossbody',
    cue: 'Pull the arm across your chest — rear shoulder lets go.',
    targets: ['shoulders'],
    holdSeconds: 25,
    perSide: true,
  },
  {
    id: 'st-triceps',
    name: 'Overhead Triceps Stretch',
    poseId: 'tricepsstretch',
    cue: 'Elbow to the sky, hand down the spine, gently guide with the other hand.',
    targets: ['shoulders', 'lats'],
    holdSeconds: 25,
    perSide: true,
  },
  {
    id: 'st-calf',
    name: 'Wall Calf Stretch',
    poseId: 'calfstretch',
    cue: 'Back leg long, heel pressing down, lean into the wall until the calf talks.',
    targets: ['calves'],
    holdSeconds: 30,
    perSide: true,
  },
]

/** Pick the best rest stretch for what was just loaded. */
export function pickStretch(loaded: BodyRegion[], excludeId?: string): Stretch {
  const scored = STRETCHES.filter((s) => s.id !== excludeId)
    .map((s) => ({
      s,
      score: s.targets.reduce((acc, t) => acc + (loaded.includes(t) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
  const best = scored.filter((x) => x.score === scored[0].score)
  return best[Math.floor(Math.random() * best.length)].s
}
