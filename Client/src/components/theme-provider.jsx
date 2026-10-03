import { createContext, useContext, useEffect, useState } from "react"

// Same key as the pre-paint script in index.html.
export const THEME_STORAGE_KEY = "landinpage-theme"

const ThemeProviderContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
})

const systemTheme = () => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

function readStoredTheme(fallback) {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || fallback
  } catch {
    return fallback
  }
}

/** Light / dark / system theme. Applies the `dark` class on <html> and remembers the choice. */
export function ThemeProvider({ children, defaultTheme = "system" }) {
  const [theme, setThemeState] = useState(() => readStoredTheme(defaultTheme))
  const [system, setSystem] = useState(systemTheme)

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => setSystem(systemTheme())
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme = theme === "system" ? system : theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const setTheme = (next) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); the choice still applies for this visit.
    }
    setThemeState(next)
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeProviderContext)
