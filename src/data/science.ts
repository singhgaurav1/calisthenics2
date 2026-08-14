/** Content for "The Method" page — the evidence behind the programming. */

export interface MethodSection {
  title: string
  body: string
}

export const METHOD_SECTIONS: MethodSection[] = [
  {
    title: 'Isometrics first, movement always',
    body: 'The advanced skills you are chasing — planche, lever, flag, handstand — are isometric holds. Research on isometric training (Oranchuk et al., 2019) shows holds are joint-angle specific and respond best to accumulating 30–90 seconds of high-quality tension per session, in short sets at roughly 50–70% of your maximum hold. That is exactly how Ascend doses your holds. Around every isometric we keep a dynamic movement pattern (rows, presses, negatives) so strength develops across the whole range, not just one angle.',
  },
  {
    title: 'Rep ranges with receipts',
    body: 'Strength-focused steps use 3–8 hard reps with 2–3+ minutes of rest — meta-analyses (Grgic et al., 2018) show longer rests produce greater strength gains. Muscle- and technique-building steps use 8–15 reps stopped 1–3 reps short of failure, which builds muscle just as well as grinding to failure while keeping quality high (Schoenfeld et al., 2017; RIR-based training evidence).',
  },
  {
    title: 'Eccentrics unlock the impossible',
    body: 'You cannot pull a muscle-up you do not have — but you can lower through one. Muscles produce 20–50% more force eccentrically, and eccentric-only training builds concentric strength you can not yet express. That is why negatives (pull-up, handstand push-up, flag lowers, muscle-up transitions) are the bridge exercises in every path.',
  },
  {
    title: 'Rest is training too',
    body: 'Ascend fills your rest timers with recommended stretches matched to what you just loaded. Evidence shows 20–30s of easy static stretching between sets does not harm strength performance and reliably improves range of motion over weeks (Behm et al., 2016). Rest becomes mobility income instead of phone-scrolling.',
  },
  {
    title: 'Tendons keep tendon time',
    body: 'Straight-arm skills load tendons ferociously, and tendons adapt more slowly than muscle. Heavy isometric loading is well tolerated and even analgesic for tendons (Rio et al., 2015), but progressing lever length too fast is the classic calisthenics injury. Mastery gates in this app (e.g. hold standards met in two separate sessions) exist to give your connective tissue its adaptation time.',
  },
  {
    title: 'Adaptive by design',
    body: 'After every set you log what you actually achieved and how hard it felt (RPE). The engine raises your next targets when you exceed them, unlocks the next level when you hit the mastery standard twice, and suggests stepping back after repeated sessions well below target. Autoregulated progression like this tracks your real recovery, sleep and life — not a spreadsheet fantasy.',
  },
  {
    title: 'Safe from 8 to 40',
    body: 'Resistance and bodyweight training are safe and beneficial for children and adolescents when technique comes first and maximal grinds are avoided (Lloyd et al., 2014 international consensus; Faigenbaum et al.). In kid mode Ascend trims set counts, caps hold durations, and keeps every prescription 2+ reps away from failure. Skills like headstands and German hangs carry explicit youth guidance — spot them, support them, make them play.',
  },
]

export const REFERENCES: { label: string; detail: string }[] = [
  {
    label: 'Oranchuk et al., 2019',
    detail: 'Isometric training and long-term adaptations: effects of muscle length, intensity and intent. Scand J Med Sci Sports.',
  },
  {
    label: 'Grgic et al., 2018',
    detail: 'Effects of rest interval duration in resistance training on measures of muscular strength: a systematic review. Sports Medicine.',
  },
  {
    label: 'Schoenfeld et al., 2017',
    detail: 'Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis. J Strength Cond Res.',
  },
  {
    label: 'Behm et al., 2016',
    detail: 'Acute effects of muscle stretching on physical performance, range of motion, and injury incidence: a systematic review. Appl Physiol Nutr Metab.',
  },
  {
    label: 'Rio et al., 2015',
    detail: 'Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy. Br J Sports Med.',
  },
  {
    label: 'Lloyd et al., 2014',
    detail: 'Position statement on youth resistance training: the 2014 International Consensus. Br J Sports Med.',
  },
  {
    label: 'McGill, 2010',
    detail: 'Core training: evidence translating to better performance and injury prevention. Strength Cond J.',
  },
  {
    label: 'Faigenbaum et al., 2009',
    detail: 'Youth resistance training: updated position statement from the NSCA. J Strength Cond Res.',
  },
]

/** Rotating "science nugget" tips for the home screen. */
export const DAILY_TIPS: string[] = [
  'Longer rests build more strength. 2–3 minutes between hard sets is not lazy — it is the protocol (Grgic 2018).',
  'Isometric holds are angle-specific: train the exact shape you want to own (Oranchuk 2019).',
  'Stopping 1–3 reps before failure builds muscle just as well as grinding — and you recover faster (Schoenfeld 2017).',
  'Tendons adapt slower than muscles. When a lever feels easy, give it one more week anyway (Rio 2015).',
  'Balance skills love frequency: five short handstand attempts beat one exhausting session.',
  'Eccentrics are a superpower — you are up to 50% stronger lowering than lifting. Use negatives to buy skills early.',
  '30 seconds of easy stretching during rest improves range of motion without hurting your next set (Behm 2016).',
  'Strong external rotators keep shoulders centered. Two quiet sets of rotator work outlive any max attempt.',
  'Kids and teens: technique first, never maximal grinds — strength will come sprinting (Lloyd 2014).',
  'Film your holds from the side. The camera is the most honest coach you will ever hire.',
]
