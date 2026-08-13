import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { BottomNav } from './components/BottomNav'
import { useAppStore } from './store/useAppStore'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Journey from './pages/Journey'
import PathDetail from './pages/PathDetail'
import ExerciseDetail from './pages/ExerciseDetail'
import SessionPlayer from './pages/SessionPlayer'
import Progress from './pages/Progress'
import ProfilePage from './pages/ProfilePage'
import MethodPage from './pages/MethodPage'
import PoseGallery from './pages/PoseGallery'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function Shell() {
  const profile = useAppStore((s) => s.profile)
  const location = useLocation()

  const hideNav = location.pathname === '/session' || location.pathname === '/onboarding'

  if (!profile && location.pathname !== '/onboarding' && location.pathname !== '/poses') {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Home />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/journey/:pathId" element={<PathDetail />} />
        <Route path="/exercise/:exerciseId" element={<ExerciseDetail />} />
        <Route path="/session" element={<SessionPlayer />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/method" element={<MethodPage />} />
        <Route path="/poses" element={<PoseGallery />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
