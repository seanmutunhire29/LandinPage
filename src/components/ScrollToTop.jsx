import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/** Scroll to the top on route changes, unless navigating to an in-page anchor. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}
