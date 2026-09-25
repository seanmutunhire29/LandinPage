import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// WebContainers need a cross-origin isolated page (SharedArrayBuffer).
// `credentialless` keeps third-party resources like Google Fonts loading.
const crossOriginIsolation = {
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: { headers: crossOriginIsolation },
  preview: { headers: crossOriginIsolation },
})
