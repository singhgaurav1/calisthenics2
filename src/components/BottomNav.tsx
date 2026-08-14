import { NavLink } from 'react-router-dom'

const TABS = [
  {
    to: '/',
    label: 'Today',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6">
        <path d="M12 3l9 8h-2.5v9h-4.5v-6h-4v6H5.5v-9H3l9-8z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/journey',
    label: 'Journey',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6">
        <path d="M4 19l5-14m6 14L20 5M4 12h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6">
        <path d="M4 20V10m6 10V4m6 16v-7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700/60 bg-ink-900/90 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium tracking-wide transition-colors ${
                isActive ? 'text-volt-400' : 'text-ink-300'
              }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
