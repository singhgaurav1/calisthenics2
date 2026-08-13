/**
 * Parametric stick-figure pose library.
 *
 * Every pose is defined on a 120 x 84 canvas (floor at y = 72) as a set of
 * polylines (torso, arms, legs) plus a head position and optional props
 * (floor, wall, bar, pole, box, ball). A single renderer (PoseFigure) draws
 * all of them in a consistent, minimal line-art style.
 */

export type Point = [number, number]

export type PoseProp =
  | { kind: 'floor' }
  | { kind: 'wall'; x: number }
  | { kind: 'bar'; y: number; x1: number; x2: number }
  | { kind: 'pole'; x: number }
  | { kind: 'box'; x: number; y: number; w: number; h: number }
  | { kind: 'ball'; x: number; y: number; r: number }

export interface PoseDef {
  head: Point
  /** Polylines: torso, arms, legs — drawn with rounded caps/joins. */
  lines: Point[][]
  props?: PoseProp[]
}

const FLOOR: PoseProp = { kind: 'floor' }

export const POSES: Record<string, PoseDef> = {
  /* ------------------------------------------------------------------ */
  /* Handstand & headstand family                                        */
  /* ------------------------------------------------------------------ */

  frogstand: {
    head: [79, 51],
    props: [FLOOR],
    lines: [
      [[72, 55], [52, 46]], // torso
      [[72, 56], [67, 64], [69, 71]], // arm
      [[52, 46], [61, 56], [52, 63]], // tucked leg resting on elbow
    ],
  },

  headstand: {
    head: [64, 66],
    props: [FLOOR],
    lines: [
      [[64, 60], [62, 36]], // torso (vertical, head down)
      [[62, 36], [63, 20], [64, 6]], // legs up
      [[64, 58], [73, 66], [76, 71]], // arm (tripod)
      [[64, 58], [55, 66], [52, 71]], // arm (tripod)
    ],
  },

  wallwalk: {
    head: [37, 46],
    props: [FLOOR, { kind: 'wall', x: 102 }],
    lines: [
      [[39, 52], [63, 40]], // torso inclined
      [[39, 52], [38, 62], [37, 71]], // arm to floor
      [[63, 40], [80, 36], [96, 32], [102, 30]], // legs to wall
    ],
  },

  wallhandstand: {
    head: [64, 55],
    props: [FLOOR, { kind: 'wall', x: 50 }],
    lines: [
      [[59, 50], [56, 28]], // torso
      [[56, 28], [54, 15], [52, 5]], // legs to wall
      [[59, 50], [58, 60], [58, 71]], // arm
    ],
  },

  handstand: {
    head: [66, 55],
    props: [FLOOR],
    lines: [
      [[60, 50], [60, 28]], // torso
      [[60, 28], [57, 14], [56, 4]], // leg (slight split)
      [[60, 28], [64, 15], [66, 5]], // leg
      [[60, 50], [60, 61], [60, 71]], // arm
    ],
  },

  presshandstand: {
    head: [67, 55],
    props: [FLOOR],
    lines: [
      [[61, 51], [58, 30]], // torso (hips over shoulders)
      [[58, 30], [44, 27], [31, 25]], // straddle leg forward
      [[58, 30], [72, 28], [85, 26]], // straddle leg back
      [[61, 51], [60, 61], [60, 71]], // arm
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Push-up / HSPU family                                               */
  /* ------------------------------------------------------------------ */

  inclinepushup: {
    head: [92, 38],
    props: [FLOOR, { kind: 'box', x: 86, y: 54, w: 24, h: 18 }],
    lines: [
      [[86, 44], [58, 56]], // torso
      [[86, 44], [92, 50], [93, 54]], // bent arm to box
      [[58, 56], [40, 62], [24, 68], [19, 72]], // legs
    ],
  },

  pushup: {
    head: [95, 51],
    props: [FLOOR],
    lines: [
      [[88, 56], [56, 60]], // torso
      [[87, 56], [93, 64], [87, 71]], // bent arm
      [[56, 60], [38, 64], [22, 68], [18, 72]], // legs
    ],
  },

  diamondpushup: {
    head: [95, 52],
    props: [FLOOR],
    lines: [
      [[88, 57], [56, 61]], // torso
      [[87, 57], [95, 63], [84, 70]], // arm tucked to midline
      [[56, 61], [38, 65], [22, 69], [18, 72]], // legs
    ],
  },

  archerpushup: {
    head: [80, 49],
    props: [FLOOR],
    lines: [
      [[74, 54], [46, 60]], // torso
      [[73, 54], [79, 63], [74, 71]], // bent working arm
      [[74, 55], [90, 62], [102, 70]], // straight archer arm out
      [[46, 60], [32, 64], [20, 68], [16, 72]], // legs
    ],
  },

  unevenpushup: {
    head: [94, 49],
    props: [FLOOR, { kind: 'ball', x: 98, y: 66, r: 6 }],
    lines: [
      [[87, 54], [55, 60]], // torso
      [[86, 54], [93, 57], [97, 61]], // arm on ball
      [[86, 55], [82, 64], [78, 71]], // arm on floor
      [[55, 60], [37, 64], [21, 68], [17, 72]], // legs
    ],
  },

  inclineoap: {
    head: [90, 36],
    props: [FLOOR, { kind: 'box', x: 84, y: 52, w: 26, h: 20 }],
    lines: [
      [[84, 42], [56, 56]], // torso
      [[84, 42], [90, 48], [92, 52]], // single working arm
      [[82, 45], [74, 50], [70, 46]], // free arm behind back
      [[56, 56], [40, 62], [24, 68], [19, 72]], // legs (wide feet)
    ],
  },

  oap: {
    head: [94, 48],
    props: [FLOOR],
    lines: [
      [[87, 53], [54, 59]], // torso
      [[86, 53], [92, 62], [86, 71]], // single working arm
      [[85, 55], [76, 60], [72, 55]], // free arm behind back
      [[54, 59], [36, 63], [20, 67], [15, 72]], // legs (wide base)
    ],
  },

  pikepushup: {
    head: [89, 58],
    props: [FLOOR],
    lines: [
      [[85, 50], [58, 28]], // torso (hips high)
      [[85, 50], [89, 61], [91, 71]], // bent arm
      [[58, 28], [42, 50], [30, 68], [27, 72]], // legs
    ],
  },

  elevatedpike: {
    head: [79, 54],
    props: [FLOOR, { kind: 'box', x: 8, y: 48, w: 24, h: 24 }],
    lines: [
      [[75, 48], [51, 26]], // torso
      [[75, 48], [77, 60], [78, 71]], // arm
      [[51, 26], [37, 38], [26, 46]], // legs to box
    ],
  },

  wallhspu: {
    head: [66, 61],
    props: [FLOOR, { kind: 'wall', x: 50 }],
    lines: [
      [[60, 51], [56, 28]], // torso
      [[56, 28], [54, 15], [52, 5]], // legs to wall
      [[60, 51], [67, 61], [62, 71]], // bent arm (head near floor)
    ],
  },

  hspu: {
    head: [66, 60],
    props: [FLOOR],
    lines: [
      [[60, 50], [58, 28]], // torso
      [[58, 28], [55, 14], [54, 4]], // leg
      [[58, 28], [62, 15], [64, 5]], // leg
      [[60, 50], [67, 60], [61, 71]], // bent arm
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Planche family                                                      */
  /* ------------------------------------------------------------------ */

  plank: {
    head: [96, 41],
    props: [FLOOR],
    lines: [
      [[90, 46], [58, 54]], // torso
      [[89, 47], [88, 59], [87, 71]], // straight arm
      [[58, 54], [40, 60], [24, 66], [20, 72]], // legs
    ],
  },

  planchelean: {
    head: [99, 40],
    props: [FLOOR],
    lines: [
      [[92, 46], [60, 52]], // torso (shoulders past wrists)
      [[92, 47], [87, 59], [82, 71]], // arm angled back
      [[60, 52], [42, 58], [26, 64], [22, 71]], // legs
    ],
  },

  pseudopushup: {
    head: [97, 46],
    props: [FLOOR],
    lines: [
      [[90, 52], [58, 58]], // torso
      [[89, 52], [95, 62], [84, 71]], // bent arm, hands back
      [[58, 58], [40, 63], [24, 67], [20, 72]], // legs
    ],
  },

  tuckplanche: {
    head: [74, 45],
    props: [FLOOR],
    lines: [
      [[66, 50], [46, 52]], // torso horizontal
      [[66, 50], [62, 60], [60, 71]], // arm leaning forward
      [[46, 52], [52, 63], [44, 66]], // tucked legs
    ],
  },

  advtuckplanche: {
    head: [75, 44],
    props: [FLOOR],
    lines: [
      [[67, 49], [43, 50]], // flatter torso
      [[67, 49], [63, 60], [60, 71]], // arm
      [[43, 50], [47, 62], [38, 64]], // knees at 90°
    ],
  },

  straddleplanche: {
    head: [76, 43],
    props: [FLOOR],
    lines: [
      [[68, 48], [44, 48]], // torso horizontal
      [[44, 48], [28, 44], [14, 42]], // straddle leg
      [[44, 48], [30, 52], [16, 54]], // straddle leg
      [[68, 48], [64, 60], [60, 71]], // arm
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Front lever family (bar overhead)                                   */
  /* ------------------------------------------------------------------ */

  hollowbody: {
    head: [89, 52],
    props: [FLOOR],
    lines: [
      [[82, 58], [60, 66]], // torso, low back pressed down
      [[82, 58], [91, 52], [100, 48]], // arms overhead
      [[60, 66], [42, 62], [26, 58]], // legs lifted
    ],
  },

  archhold: {
    head: [87, 51],
    props: [FLOOR],
    lines: [
      [[80, 57], [60, 66]], // torso, chest lifted
      [[80, 57], [91, 52], [100, 48]], // arms reaching forward
      [[60, 66], [44, 61], [28, 56]], // legs lifted behind
    ],
  },

  tucklever: {
    head: [50, 36],
    props: [{ kind: 'bar', y: 8, x1: 40, x2: 84 }],
    lines: [
      [[57, 33], [60, 19], [62, 8]], // arm to bar
      [[57, 33], [76, 36]], // torso horizontal
      [[76, 36], [72, 47], [62, 46]], // tucked knees
    ],
  },

  advtucklever: {
    head: [49, 34],
    props: [{ kind: 'bar', y: 8, x1: 38, x2: 86 }],
    lines: [
      [[56, 32], [60, 19], [62, 8]], // arm
      [[56, 32], [80, 34]], // torso flatter
      [[80, 34], [80, 46], [70, 48]], // knees bent 90°
    ],
  },

  oneleglever: {
    head: [47, 33],
    props: [{ kind: 'bar', y: 8, x1: 36, x2: 88 }],
    lines: [
      [[54, 31], [59, 18], [62, 8]], // arm
      [[54, 31], [78, 33]], // torso
      [[78, 33], [94, 33], [106, 33]], // extended leg
      [[78, 33], [78, 45], [69, 47]], // tucked leg
    ],
  },

  straddlelever: {
    head: [43, 32],
    props: [{ kind: 'bar', y: 8, x1: 34, x2: 90 }],
    lines: [
      [[50, 30], [57, 18], [61, 8]], // arm
      [[50, 30], [74, 32]], // torso
      [[74, 32], [90, 28], [105, 26]], // straddle leg
      [[74, 32], [90, 37], [105, 40]], // straddle leg
    ],
  },

  frontlever: {
    head: [41, 32],
    props: [{ kind: 'bar', y: 8, x1: 32, x2: 92 }],
    lines: [
      [[48, 30], [56, 18], [61, 8]], // arm
      [[48, 30], [74, 32]], // torso
      [[74, 32], [90, 32], [106, 33]], // legs straight
    ],
  },

  frontleverrow: {
    head: [45, 26],
    props: [{ kind: 'bar', y: 8, x1: 36, x2: 88 }],
    lines: [
      [[52, 25], [59, 14], [62, 8]], // bent arm pulling
      [[52, 25], [76, 28]], // torso
      [[76, 28], [77, 40], [67, 42]], // tucked knees
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Flag family (vertical pole)                                         */
  /* ------------------------------------------------------------------ */

  sideplank: {
    head: [41, 45],
    props: [FLOOR],
    lines: [
      [[46, 52], [66, 60]], // torso diagonal
      [[66, 60], [88, 68], [94, 71]], // stacked legs
      [[46, 54], [45, 62], [44, 71]], // support arm
      [[46, 52], [50, 42], [53, 33]], // top arm raised
    ],
  },

  sideplankstar: {
    head: [40, 42],
    props: [FLOOR],
    lines: [
      [[45, 49], [65, 58]], // torso
      [[65, 58], [86, 66], [92, 70]], // bottom leg
      [[65, 58], [82, 50], [95, 44]], // top leg raised
      [[45, 51], [44, 61], [43, 71]], // support arm
      [[45, 49], [49, 39], [52, 30]], // top arm
    ],
  },

  flagsupport: {
    head: [47, 22],
    props: [FLOOR, { kind: 'pole', x: 30 }],
    lines: [
      [[44, 29], [52, 50]], // torso leaning
      [[44, 30], [36, 25], [30, 20]], // top arm to pole
      [[45, 34], [36, 42], [30, 47]], // bottom arm to pole
      [[52, 50], [55, 60], [57, 70]], // legs on floor
    ],
  },

  tuckflag: {
    head: [47, 27],
    props: [FLOOR, { kind: 'pole', x: 30 }],
    lines: [
      [[44, 34], [59, 40]], // torso off the pole
      [[43, 32], [36, 25], [30, 19]], // top arm
      [[45, 36], [36, 42], [30, 46]], // bottom arm pressing
      [[59, 40], [66, 48], [58, 52]], // tucked knees
    ],
  },

  verticalflag: {
    head: [41, 46],
    props: [FLOOR, { kind: 'pole', x: 30 }],
    lines: [
      [[44, 40], [52, 26]], // torso angled up
      [[43, 38], [36, 27], [30, 18]], // top arm
      [[45, 42], [36, 45], [30, 47]], // bottom arm
      [[52, 26], [56, 14], [58, 4]], // legs up
    ],
  },

  straddleflag: {
    head: [46, 27],
    props: [FLOOR, { kind: 'pole', x: 30 }],
    lines: [
      [[44, 34], [59, 38]], // torso
      [[43, 32], [36, 25], [30, 19]], // top arm
      [[45, 36], [36, 42], [30, 46]], // bottom arm
      [[59, 38], [75, 32], [90, 28]], // straddle leg
      [[59, 38], [75, 44], [90, 48]], // straddle leg
    ],
  },

  humanflag: {
    head: [46, 28],
    props: [FLOOR, { kind: 'pole', x: 30 }],
    lines: [
      [[44, 35], [60, 37]], // torso horizontal
      [[43, 33], [36, 26], [30, 19]], // top arm
      [[45, 37], [36, 42], [30, 46]], // bottom arm
      [[60, 37], [78, 36], [95, 35]], // leg
      [[60, 37], [78, 39], [94, 41]], // leg (slight split)
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Pull family (bar overhead)                                          */
  /* ------------------------------------------------------------------ */

  deadhang: {
    head: [60, 23],
    props: [{ kind: 'bar', y: 8, x1: 42, x2: 78 }],
    lines: [
      [[57, 29], [57, 18], [58, 8]], // arm
      [[63, 29], [63, 18], [62, 8]], // arm
      [[60, 30], [60, 50]], // torso
      [[60, 50], [59, 60], [58, 69]], // legs
    ],
  },

  scappull: {
    head: [60, 19],
    props: [{ kind: 'bar', y: 8, x1: 42, x2: 78 }],
    lines: [
      [[57, 25], [57, 16], [58, 8]], // arm (shoulders packed down)
      [[63, 25], [63, 16], [62, 8]], // arm
      [[60, 26], [60, 46]], // torso
      [[60, 46], [59, 57], [58, 66]], // legs
    ],
  },

  bodyrow: {
    head: [72, 47],
    props: [FLOOR, { kind: 'bar', y: 38, x1: 42, x2: 82 }],
    lines: [
      [[66, 52], [46, 60]], // torso diagonal under bar
      [[66, 52], [62, 44], [61, 38]], // pulling arm
      [[46, 60], [34, 66], [25, 70]], // legs, heels down
    ],
  },

  negpullup: {
    head: [62, 11],
    props: [{ kind: 'bar', y: 14, x1: 38, x2: 86 }],
    lines: [
      [[58, 20], [52, 19], [52, 14]], // bent arm, chin over bar
      [[66, 20], [72, 19], [70, 14]], // bent arm
      [[62, 20], [60, 42]], // torso
      [[60, 42], [62, 54], [58, 62]], // legs, knees soft
    ],
  },

  pullup: {
    head: [62, 25],
    props: [{ kind: 'bar', y: 12, x1: 36, x2: 88 }],
    lines: [
      [[58, 31], [51, 23], [53, 12]], // arm at ~90°
      [[66, 31], [73, 23], [71, 12]], // arm
      [[62, 31], [60, 52]], // torso
      [[60, 52], [62, 62], [58, 70]], // legs
    ],
  },

  chesttobar: {
    head: [62, 10],
    props: [{ kind: 'bar', y: 15, x1: 36, x2: 88 }],
    lines: [
      [[58, 17], [50, 19], [50, 15]], // arm pulled high
      [[66, 17], [74, 19], [74, 15]], // arm
      [[62, 17], [60, 40]], // torso, chest at bar
      [[60, 40], [62, 52], [58, 61]], // legs
    ],
  },

  muscleupneg: {
    head: [62, 10],
    props: [{ kind: 'bar', y: 26, x1: 38, x2: 86 }],
    lines: [
      [[57, 18], [55, 22], [54, 26]], // straight arm support
      [[67, 18], [69, 22], [70, 26]], // arm
      [[62, 18], [60, 40]], // torso above bar
      [[60, 40], [59, 53], [57, 64]], // legs
    ],
  },

  muscleup: {
    head: [66, 13],
    props: [{ kind: 'bar', y: 30, x1: 38, x2: 86 }],
    lines: [
      [[63, 20], [60, 25], [58, 30]], // arm pressing out
      [[67, 20], [72, 26], [71, 30]], // arm
      [[65, 20], [58, 40]], // torso leaning over bar
      [[58, 40], [56, 53], [54, 65]], // legs
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Squat family                                                        */
  /* ------------------------------------------------------------------ */

  airsquat: {
    head: [56, 27],
    props: [FLOOR],
    lines: [
      [[54, 34], [48, 52]], // torso, slight hinge
      [[54, 36], [66, 34], [76, 33]], // arms forward
      [[48, 52], [66, 56], [58, 70]], // thigh + shin
      [[58, 70], [67, 71]], // foot
    ],
  },

  deepsquat: {
    head: [54, 31],
    props: [FLOOR],
    lines: [
      [[52, 38], [48, 60]], // torso upright
      [[52, 40], [63, 40], [72, 40]], // arms forward
      [[48, 60], [67, 55], [58, 70]], // thigh + shin, hips low
      [[58, 70], [67, 71]], // foot
    ],
  },

  splitsquat: {
    head: [58, 25],
    props: [FLOOR],
    lines: [
      [[58, 32], [58, 52]], // torso vertical
      [[58, 34], [64, 43], [59, 50]], // hand to hip
      [[58, 52], [74, 54], [74, 70]], // front leg
      [[58, 52], [46, 64], [38, 70]], // rear leg
    ],
  },

  bulgariansplit: {
    head: [60, 27],
    props: [FLOOR, { kind: 'box', x: 26, y: 56, w: 20, h: 16 }],
    lines: [
      [[60, 34], [60, 54]], // torso
      [[60, 36], [66, 45], [61, 52]], // hand to hip
      [[60, 54], [74, 56], [74, 70]], // front leg
      [[60, 54], [50, 64], [40, 56]], // rear leg to box
    ],
  },

  boxpistol: {
    head: [51, 27],
    props: [FLOOR, { kind: 'box', x: 22, y: 54, w: 24, h: 18 }],
    lines: [
      [[49, 34], [44, 54]], // torso hinged to box edge
      [[49, 36], [62, 34], [74, 33]], // arms forward
      [[44, 54], [58, 58], [56, 70]], // standing leg
      [[44, 54], [62, 50], [78, 48]], // extended free leg
    ],
  },

  assistedpistol: {
    head: [52, 33],
    props: [FLOOR, { kind: 'pole', x: 86 }],
    lines: [
      [[51, 40], [46, 60]], // torso
      [[51, 42], [68, 40], [86, 38]], // arms holding support
      [[46, 60], [62, 56], [58, 70]], // standing leg
      [[46, 60], [63, 55], [79, 52]], // free leg
    ],
  },

  pistol: {
    head: [52, 33],
    props: [FLOOR],
    lines: [
      [[50, 40], [46, 62]], // torso
      [[50, 42], [64, 40], [76, 39]], // arms counterbalance
      [[46, 62], [64, 57], [60, 70]], // standing leg
      [[46, 62], [63, 56], [79, 53]], // free leg horizontal
    ],
  },

  dragonsquat: {
    head: [57, 33],
    props: [FLOOR],
    lines: [
      [[55, 40], [50, 62]], // torso
      [[55, 42], [68, 40], [78, 38]], // arms forward
      [[50, 62], [70, 55], [60, 70]], // standing leg
      [[50, 62], [36, 67], [22, 64]], // leg swept behind, hovering
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Mobility + stretches                                                */
  /* ------------------------------------------------------------------ */

  wristprep: {
    head: [80, 44],
    props: [FLOOR],
    lines: [
      [[74, 50], [50, 56]], // torso quadruped
      [[74, 50], [75, 60], [76, 70]], // arm
      [[50, 56], [50, 70], [39, 71]], // shin on floor
    ],
  },

  wristflexstretch: {
    head: [81, 45],
    props: [FLOOR],
    lines: [
      [[75, 51], [51, 56]], // torso
      [[75, 51], [72, 61], [68, 70]], // arm rocked back, fingers to knees
      [[51, 56], [51, 70], [40, 71]], // shin
    ],
  },

  sidelyinger: {
    head: [86, 58],
    props: [FLOOR],
    lines: [
      [[79, 61], [56, 65]], // torso lying on side
      [[56, 65], [43, 66], [36, 71]], // bent legs
      [[77, 61], [71, 59], [70, 46]], // top arm rotating up, elbow pinned
    ],
  },

  wallangel: {
    head: [60, 14],
    props: [FLOOR],
    lines: [
      [[60, 21], [60, 45]], // torso (back flat on wall)
      [[60, 23], [49, 25], [47, 13]], // goal-post arm
      [[60, 23], [71, 25], [73, 13]], // goal-post arm
      [[60, 45], [56, 58], [55, 70]], // leg
      [[60, 45], [64, 58], [65, 70]], // leg
    ],
  },

  tabletop: {
    head: [36, 44],
    props: [FLOOR],
    lines: [
      [[42, 50], [64, 50]], // torso facing up
      [[42, 51], [41, 61], [40, 70]], // arm
      [[64, 50], [74, 60], [72, 70]], // leg
    ],
  },

  puppypose: {
    head: [76, 60],
    props: [FLOOR],
    lines: [
      [[70, 63], [46, 56]], // torso, chest melting down
      [[70, 63], [81, 67], [92, 70]], // arms extended
      [[46, 56], [44, 70], [33, 71]], // shin
    ],
  },

  germanhang: {
    head: [69, 25],
    props: [{ kind: 'bar', y: 8, x1: 42, x2: 80 }],
    lines: [
      [[67, 27], [62, 17], [60, 8]], // arms behind body (extension)
      [[66, 29], [66, 46]], // torso hanging
      [[66, 46], [64, 57], [62, 68]], // legs
    ],
  },

  ninetyninety: {
    head: [56, 39],
    props: [FLOOR],
    lines: [
      [[56, 46], [56, 66]], // torso tall
      [[56, 48], [52, 60], [48, 70]], // hand to floor
      [[56, 66], [72, 65], [76, 71]], // front leg 90°
      [[56, 66], [45, 70], [36, 66]], // rear leg 90°
    ],
  },

  catcow: {
    head: [80, 51],
    props: [FLOOR],
    lines: [
      [[74, 53], [62, 46], [50, 55]], // rounded spine
      [[74, 53], [75, 62], [76, 70]], // arm
      [[50, 55], [50, 70], [39, 71]], // shin
    ],
  },

  threadneedle: {
    head: [63, 59],
    props: [FLOOR],
    lines: [
      [[69, 55], [47, 56]], // torso
      [[69, 56], [74, 63], [75, 70]], // support arm
      [[69, 55], [58, 62], [46, 64]], // threaded arm
      [[47, 56], [46, 70], [35, 71]], // shin
    ],
  },

  doorwaypec: {
    head: [56, 16],
    props: [FLOOR, { kind: 'wall', x: 86 }],
    lines: [
      [[56, 23], [58, 45]], // torso
      [[56, 25], [71, 23], [86, 20]], // arm on wall behind
      [[58, 45], [55, 58], [54, 70]], // leg
      [[58, 45], [63, 58], [65, 70]], // leg stepping through
    ],
  },

  forwardfold: {
    head: [46, 64],
    props: [FLOOR],
    lines: [
      [[58, 44], [49, 59]], // folded torso
      [[49, 59], [46, 66], [45, 70]], // arms dangling
      [[58, 44], [60, 57], [60, 70]], // legs straight-ish
    ],
  },

  hipflexor: {
    head: [55, 29],
    props: [FLOOR],
    lines: [
      [[54, 36], [56, 56]], // torso tall
      [[54, 38], [56, 26], [58, 16]], // arms reaching up
      [[56, 56], [70, 58], [70, 70]], // front leg
      [[56, 56], [44, 70], [32, 71]], // rear knee down
    ],
  },

  pigeon: {
    head: [53, 37],
    props: [FLOOR],
    lines: [
      [[52, 44], [54, 64]], // torso upright
      [[52, 46], [58, 56], [62, 66]], // hands to floor
      [[54, 64], [67, 68], [77, 64]], // front leg folded
      [[54, 64], [38, 68], [24, 70]], // back leg extended
    ],
  },

  crossbody: {
    head: [60, 15],
    props: [FLOOR],
    lines: [
      [[60, 22], [60, 46]], // torso
      [[64, 25], [54, 27], [45, 25]], // arm across chest
      [[56, 25], [50, 32], [47, 26]], // holding arm
      [[60, 46], [56, 58], [55, 70]], // leg
      [[60, 46], [64, 58], [65, 70]], // leg
    ],
  },

  tricepsstretch: {
    head: [60, 16],
    props: [FLOOR],
    lines: [
      [[60, 23], [60, 46]], // torso
      [[64, 24], [68, 13], [58, 9]], // arm overhead, hand behind head
      [[56, 24], [51, 16], [61, 11]], // hand pulling elbow
      [[60, 46], [56, 58], [55, 70]], // leg
      [[60, 46], [64, 58], [65, 70]], // leg
    ],
  },

  calfstretch: {
    head: [76, 30],
    props: [FLOOR, { kind: 'wall', x: 90 }],
    lines: [
      [[74, 37], [58, 52]], // torso leaning to wall
      [[74, 38], [82, 37], [90, 36]], // arms to wall
      [[58, 52], [66, 60], [64, 70]], // front knee bent
      [[58, 52], [47, 62], [38, 70]], // back leg straight, heel down
    ],
  },
}

export type PoseId = keyof typeof POSES
