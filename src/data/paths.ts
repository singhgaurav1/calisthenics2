import type { SkillPath } from '../types'

/**
 * The nine skill arcs of the journey. Colors are used for path emblems,
 * progress rings and pose figures.
 */
export const PATHS: SkillPath[] = [
  {
    id: 'handstand',
    name: 'Handstand & Headstand',
    goal: 'Freestanding handstand & press',
    tagline: 'Own your balance upside-down',
    category: 'skill',
    color: '#22d3ee',
    poseId: 'handstand',
  },
  {
    id: 'hspu',
    name: 'Handstand Push-Up',
    goal: 'Strict handstand push-up',
    tagline: 'Press the world away',
    category: 'push',
    color: '#a78bfa',
    poseId: 'hspu',
  },
  {
    id: 'planche',
    name: 'Planche',
    goal: 'Straddle planche hold',
    tagline: 'Float parallel to the floor',
    category: 'push',
    color: '#f472b6',
    poseId: 'straddleplanche',
  },
  {
    id: 'frontlever',
    name: 'Front Lever',
    goal: 'Full front lever hold',
    tagline: 'A body of steel, held flat',
    category: 'pull',
    color: '#fb923c',
    poseId: 'frontlever',
  },
  {
    id: 'flag',
    name: 'Human Flag',
    goal: 'Full human flag hold',
    tagline: 'Fly sideways off a pole',
    category: 'pull',
    color: '#f87171',
    poseId: 'humanflag',
  },
  {
    id: 'pull',
    name: 'Pull-Up & Muscle-Up',
    goal: 'Strict muscle-up',
    tagline: 'From your first hang to over the bar',
    category: 'pull',
    color: '#facc15',
    poseId: 'pullup',
  },
  {
    id: 'pushup',
    name: 'One-Arm Push-Up',
    goal: 'Full one-arm push-up',
    tagline: 'One arm. Full control.',
    category: 'push',
    color: '#bef264',
    poseId: 'oap',
  },
  {
    id: 'squat',
    name: 'Pistol & Dragon Squat',
    goal: 'Pistol + dragon squat',
    tagline: 'Single-leg strength & control',
    category: 'legs',
    color: '#34d399',
    poseId: 'pistol',
  },
  {
    id: 'mobility',
    name: 'Mobility & Rotator Care',
    goal: 'Bulletproof shoulders, wrists & hips',
    tagline: 'The quiet work that unlocks everything',
    category: 'mobility',
    color: '#5eead4',
    poseId: 'ninetyninety',
  },
]

export const PATH_BY_ID = Object.fromEntries(PATHS.map((p) => [p.id, p]))
