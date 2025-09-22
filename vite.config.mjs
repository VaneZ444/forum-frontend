import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:50050',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://localhost:50050',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})