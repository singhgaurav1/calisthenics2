import { POSES } from '../data/poses'
import { PoseFigure } from '../components/PoseFigure'

/** Dev-only gallery to visually audit every pose at /poses. */
export default function PoseGallery() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-8">
      <h1 className="font-display text-2xl font-bold">Pose Gallery ({Object.keys(POSES).length})</h1>
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Object.keys(POSES).map((id) => (
          <div key={id} className="card p-2">
            <PoseFigure poseId={id} className="h-24 w-full" />
            <p className="mt-1 truncate text-center text-[10px] text-ink-300">{id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
