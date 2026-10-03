// Bundle Monaco locally (instead of the CDN loader) so it works under the
// cross-origin isolation headers WebContainers require.

import * as monaco from "monaco-editor"
import { loader } from "@monaco-editor/react"
import EditorWorker from "monaco-editor/editor/editor.worker?worker"
import JsonWorker from "monaco-editor/language/json/json.worker?worker"
import CssWorker from "monaco-editor/language/css/css.worker?worker"
import HtmlWorker from "monaco-editor/language/html/html.worker?worker"
import TsWorker from "monaco-editor/language/typescript/ts.worker?worker"

self.MonacoEnvironment = {
  getWorker(_id, label) {
    if (label === "json") return new JsonWorker()
    if (label === "css" || label === "scss" || label === "less") return new CssWorker()
    if (label === "html") return new HtmlWorker()
    if (label === "typescript" || label === "javascript") return new TsWorker()
    return new EditorWorker()
  },
}

// Generated projects are JSX without a tsconfig; skip diagnostics that would flag valid code.
// (monaco-editor >= 0.55 exposes the TS service as `monaco.typescript`.)
const ts = monaco.typescript ?? monaco.languages.typescript
ts?.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: true })
ts?.javascriptDefaults.setCompilerOptions({ jsx: ts.JsxEmit.Preserve, allowJs: true, allowNonTsExtensions: true })

loader.config({ monaco })

// Neutral light/dark themes matching the app's shadcn tokens (Monaco can't read CSS
// variables, so the hex values mirror --card, --foreground, --muted-foreground, --accent).
export const MONACO_THEMES = { light: "landinpage-light", dark: "landinpage-dark" }

monaco.editor.defineTheme(MONACO_THEMES.light, {
  base: "vs",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#0a0a0a",
    "editor.lineHighlightBackground": "#f5f5f5",
    "editor.lineHighlightBorder": "#00000000",
    "editorLineNumber.foreground": "#a3a3a3",
    "editorLineNumber.activeForeground": "#0a0a0a",
    "editor.selectionBackground": "#d4d4d4",
    "editor.inactiveSelectionBackground": "#e5e5e5",
    "editorCursor.foreground": "#171717",
    "editorIndentGuide.background1": "#e5e5e5",
  },
})

monaco.editor.defineTheme(MONACO_THEMES.dark, {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#171717",
    "editor.foreground": "#fafafa",
    "editor.lineHighlightBackground": "#262626",
    "editor.lineHighlightBorder": "#00000000",
    "editorLineNumber.foreground": "#737373",
    "editorLineNumber.activeForeground": "#fafafa",
    "editor.selectionBackground": "#404040",
    "editor.inactiveSelectionBackground": "#333333",
    "editorCursor.foreground": "#fafafa",
    "editorIndentGuide.background1": "#262626",
  },
})

const LANGUAGES = { js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript", json: "json", css: "css", html: "html", md: "markdown", svg: "xml" }
export const languageFor = (path) => LANGUAGES[path.split(".").pop()] ?? "plaintext"
