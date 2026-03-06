import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Vite Loaded Keys:', Object.keys(env).filter(k => k.startsWith('VITE_')));

  return {
    plugins: [react()],
    define: {
      'process.env': env
    },
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
  };
});
