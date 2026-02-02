import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk (it's large)
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Split charts library into its own chunk
          'charts': ['recharts'],
          // Vendor chunk for other large libraries
          'vendor': ['html2canvas', 'jspdf']
        }
      }
    }
  },
})
