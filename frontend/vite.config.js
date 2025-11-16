import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/route': 'http://127.0.0.1:5000',
      '/stations': 'http://127.0.0.1:5000',
      '/connections': 'http://127.0.0.1:5000',
      '/dump': 'http://127.0.0.1:5000',
      '/load': 'http://127.0.0.1:5000',
      '/seed': 'http://127.0.0.1:5000',
    },
  },
})
