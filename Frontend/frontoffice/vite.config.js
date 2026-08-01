import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Root of the site — "/" opens Home in production
  base: '/',
  server: {
    port: 3001,
  },
  preview: {
    port: 3001,
  },
})
