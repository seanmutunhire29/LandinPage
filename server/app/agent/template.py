"""Base files for a generated landing page project.

Seeded into project_files when a project is created, so the WebContainer can
install dependencies and boot the dev server while the agent is still writing
sections. Stack: Vite 5 + React + Tailwind 3 (pure-JS toolchain, which runs
reliably inside WebContainers; Tailwind 4 / Vite 8 depend on native binaries).
"""

import json
import re
from urllib.parse import quote_plus

PACKAGE_JSON = {
    "name": "landing-page",
    "private": True,
    "version": "0.0.0",
    "type": "module",
    "scripts": {"dev": "vite", "build": "vite build", "preview": "vite preview"},
    "dependencies": {
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "lucide-react": "^0.460.0",
        "framer-motion": "^11.11.0",
    },
    "devDependencies": {
        "@vitejs/plugin-react": "^4.3.4",
        "autoprefixer": "^10.4.20",
        "postcss": "^8.4.49",
        "tailwindcss": "^3.4.17",
        "vite": "^5.4.11",
    },
}

VITE_CONFIG = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
"""

POSTCSS_CONFIG = """export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
"""

TAILWIND_CONFIG = """/** Theme values come from CSS variables in src/styles/tokens.css (generated from the design spec). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
%(colors)s
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      borderRadius: {
%(radii)s
      },
      spacing: {
%(spacing)s
      },
      transitionTimingFunction: {
        brand: 'var(--ease-brand)',
      },
    },
  },
  plugins: [],
}
"""

MAIN_JSX = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""

INDEX_CSS = """@import './styles/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body {
    background: var(--color-background);
    color: var(--color-text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); font-weight: var(--font-heading-weight); }
}
"""

APP_JSX = """// Placeholder until the agent writes the real sections.
export default function App() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-8 text-center">
      <div>
        <h1 className="font-heading text-4xl text-text">Building your landing page...</h1>
        <p className="mt-3 text-text-muted">Sections will appear here as they are generated.</p>
      </div>
    </main>
  )
}
"""

GITIGNORE = "node_modules\ndist\n"


def _kebab(name: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()


def _css_value(v) -> str:
    return f"{v}px" if isinstance(v, (int, float)) else str(v)


def _font_link(font: dict) -> str | None:
    family = font.get("family")
    if not family:
        return None
    weight = str(font.get("weight", "")).strip()
    wght = f":wght@{weight}" if re.fullmatch(r"\d+(;\d+)*", weight) else ""
    return f'    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={quote_plus(family)}{wght}&display=swap" />'


def _font_stack(font: dict) -> str:
    fallback = font.get("fallback") or "sans-serif"
    return f"'{font.get('family', 'system-ui')}', {fallback}"


def _items(d) -> list[tuple[str, object]]:
    if isinstance(d, dict):
        return [(str(k), v) for k, v in d.items() if k != "unit"]
    if isinstance(d, list):
        return [(str(i), v) for i, v in enumerate(d)]
    return []


def build_template(spec: dict, title: str) -> dict[str, str]:
    tokens = spec.get("tokens", {}) if isinstance(spec, dict) else {}
    typo = tokens.get("typography", {})
    heading, body = typo.get("headingFont", {}), typo.get("bodyFont", {})
    roles = tokens.get("color", {}).get("roles", {})
    radii = _items(tokens.get("radiusScale", {}))
    spacing = _items(tokens.get("spacingScale", {}).get("steps", {}))
    type_steps = _items(typo.get("typeScale", {}).get("steps", {}))
    motion = tokens.get("motion", {})

    css = [":root {"]
    css += [f"  --color-{_kebab(k)}: {v};" for k, v in roles.items()]
    if tokens.get("color", {}).get("gradient"):
        css.append(f"  --gradient-brand: {tokens['color']['gradient']};")
    css.append(f"  --font-heading: {_font_stack(heading)};")
    css.append(f"  --font-body: {_font_stack(body)};")
    css.append(f"  --font-heading-weight: {heading.get('weight', 700)};")
    css += [f"  --radius-{k}: {_css_value(v)};" for k, v in radii]
    css += [f"  --space-{k}: {_css_value(v)};" for k, v in spacing]
    css += [f"  --text-step-{k}: {_css_value(v)};" for k, v in type_steps]
    for k, v in _items(motion.get("durationScale", {})):
        css.append(f"  --duration-{k}: {v}ms;")
    if isinstance(motion.get("easing"), str):
        css.append(f"  --ease-brand: {motion['easing']};")
    else:
        css.append("  --ease-brand: cubic-bezier(0.2, 0, 0, 1);")
    if isinstance(tokens.get("shadowStyle"), str):
        css.append(f"  --shadow-card: {tokens['shadowStyle']};")
    if isinstance(tokens.get("borderStyle"), str):
        css.append(f"  --border-card: {tokens['borderStyle']};")
    css.append("}\n")

    font_links = "\n".join(filter(None, {_font_link(heading), _font_link(body)}))
    index_html = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
{font_links}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""

    tailwind = TAILWIND_CONFIG % {
        "colors": "\n".join(f"        '{_kebab(k)}': 'var(--color-{_kebab(k)})'," for k in roles),
        "radii": "\n".join(f"        '{k}': 'var(--radius-{k})'," for k, _ in radii),
        "spacing": "\n".join(f"        'step-{k}': 'var(--space-{k})'," for k, _ in spacing),
    }

    return {
        "package.json": json.dumps(PACKAGE_JSON, indent=2) + "\n",
        "index.html": index_html,
        "vite.config.js": VITE_CONFIG,
        "postcss.config.js": POSTCSS_CONFIG,
        "tailwind.config.js": tailwind,
        ".gitignore": GITIGNORE,
        "design-spec.json": json.dumps(spec, indent=2) + "\n",
        "src/main.jsx": MAIN_JSX,
        "src/index.css": INDEX_CSS,
        "src/styles/tokens.css": "\n".join(css),
        "src/App.jsx": APP_JSX,
    }
