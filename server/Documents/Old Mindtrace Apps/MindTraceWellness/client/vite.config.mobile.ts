import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Mobile-specific Vite configuration for Capacitor
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-select', '@radix-ui/react-slider'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          query: ['@tanstack/react-query'],
          router: ['wouter'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  base: './'
})