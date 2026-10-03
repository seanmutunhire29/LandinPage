import { createContext, useContext, useEffect } from "react"
import { cn } from "@/lib/utils"
import { loadPairing } from "@/lib/fonts"

const ThemeContext = createContext(null)

/** The resolved theme of the nearest <ThemeScope>, for previews and portaled popovers. */
export const useScopedTheme = () => useContext(ThemeContext)

/**
 * Re-skins every shadcn/ui component inside it with a resolved theme (see
 * lib/theme.js) by overriding the CSS variables they read. `data-theme-scope`
 * resets the light tokens and opts the subtree out of `dark:` variants (index.css).
 */
export function ThemeScope({ theme, className, style, children }) {
  useEffect(() => loadPairing(theme?.pairing), [theme?.pairing])
  if (!theme) return children
  return (
    <ThemeContext.Provider value={theme}>
      <div
        data-theme-scope=""
        className={cn("bg-background text-foreground", className)}
        style={{ ...theme.vars, fontFamily: theme.bodyFont, ...style }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

/**
 * Props for portaled content (tooltips, popovers) so it keeps the scoped theme and,
 * like the scope itself, ignores the app's dark mode.
 */
export function usePortalProps() {
  const theme = useScopedTheme()
  return theme ? { "data-theme-scope": "", style: { ...theme.vars, fontFamily: theme.bodyFont } } : {}
}
