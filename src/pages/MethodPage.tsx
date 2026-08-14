import { useNavigate } from 'react-router-dom'
import { METHOD_SECTIONS, REFERENCES } from '../data/science'

export default function MethodPage() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-safe">
      <header className="flex items-center gap-2 pt-6">
        <button onClick={() => navigate(-1)} className="rounded-full p-2 text-ink-300" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-display text-2xl font-bold">The Method</h1>
      </header>

      <p className="mt-4 text-sm leading-relaxed text-ink-200">
        Every rep range, hold duration and rest period in Ascend traces back to published exercise
        science. Here is the reasoning — and the receipts.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {METHOD_SECTIONS.map((s) => (
          <section key={s.title} className="card p-5">
            <h2 className="font-display text-base font-bold text-volt-400">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">{s.body}</p>
          </section>
        ))}
      </div>

      <section className="card mt-6 p-5">
        <h2 className="label-caps">Key references</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {REFERENCES.map((r) => (
            <li key={r.label} className="text-xs leading-relaxed text-ink-300">
              <span className="font-semibold text-ink-100">{r.label}.</span> {r.detail}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
