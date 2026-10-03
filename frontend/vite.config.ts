/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_URL = process.env.API_URL ?? `http://127.0.0.1:${process.env.API_PORT ?? 8000}`
const WEB_PORT = Number(process.env.WEB_PORT ?? 5173)

export default defineConfig({
  plugins: [react()],
  server: {
    port: WEB_PORT,
    strictPort: true,
    proxy: { '/api': { target: API_URL, changeOrigin: true } },
  },
  preview: { port: WEB_PORT, strictPort: true },
  test: { environment: 'jsdom' },
})
