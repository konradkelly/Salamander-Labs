import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Salamander-Labs/',
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
