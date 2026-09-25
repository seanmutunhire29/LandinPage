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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
