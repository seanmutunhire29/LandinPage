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

const LANGUAGES = { js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript", json: "json", css: "css", html: "html", md: "markdown", svg: "xml" }
export const languageFor = (path) => LANGUAGES[path.split(".").pop()] ?? "plaintext"
