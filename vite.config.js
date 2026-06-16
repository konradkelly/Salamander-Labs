import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages uses /Salamander-Labs/; AWS CloudFront uses / (set VITE_BASE_PATH=/ in CI).
  base: process.env.VITE_BASE_PATH || '/Salamander-Labs/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/thumbnail': 'http://localhost:8080',
      '/process': 'http://localhost:8080',
      '/results': 'http://localhost:8080',
    },
  },
})
