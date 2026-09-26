import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Marketing from "@/pages/Marketing"
import { WizardLayout } from "@/components/wizard/WizardLayout"
import Direction from "@/pages/onboarding/Direction"
import Typography from "@/pages/onboarding/Typography"
import Color from "@/pages/onboarding/Color"
import Surface from "@/pages/onboarding/Surface"
import Components from "@/pages/onboarding/Components"
import Layout from "@/pages/onboarding/Layout"
import Motion from "@/pages/onboarding/Motion"
import Review from "@/pages/onboarding/Review"
import { ScrollToTop } from "@/components/ScrollToTop"
import { RequireAuth } from "@/components/auth/RequireAuth"
import AuthCallback from "@/pages/AuthCallback"
import Profile from "@/pages/Profile"
import Settings from "@/pages/Settings"

// Monaco + WebContainer code only loads when a project is opened.
const Workspace = lazy(() => import("@/pages/Workspace"))

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Marketing />} />
        <Route path="/onboarding" element={<WizardLayout />}>
          <Route index element={<Navigate to="direction" replace />} />
          <Route path="direction" element={<Direction />} />
          <Route path="typography" element={<Typography />} />
          <Route path="color" element={<Color />} />
          <Route path="surface" element={<Surface />} />
          <Route path="components" element={<Components />} />
          <Route path="layout" element={<Layout />} />
          <Route path="motion" element={<Motion />} />
          <Route path="review" element={<Review />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/projects" element={<Navigate to="/profile" replace />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
        <Route
          path="/settings/:section"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        {/* Direct sign-in link: the profile page shows sign-in when logged out. */}
        <Route path="/login" element={<Navigate to="/profile" replace />} />
        <Route
          path="/projects/:projectId"
          element={
            <RequireAuth>
              <Suspense fallback={<div className="h-svh bg-brand-mist" />}>
                <Workspace />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
