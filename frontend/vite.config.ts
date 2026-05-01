import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // for shadcn ui

export default defineConfig({
  plugins: [react()],
  // for shadcn ui
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), 
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})