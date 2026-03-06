import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // ── Code splitting: keep vendor libs in separate chunks ──────────
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'charts-vendor': ['recharts'],
          'motion-vendor': ['framer-motion'],
          'utils-vendor': ['date-fns', 'react-hot-toast', 'lucide-react'],
        },
      },
    },
    // Raise the warning threshold slightly so we don't see it per-chunk
    chunkSizeWarningLimit: 600,
  },
})
