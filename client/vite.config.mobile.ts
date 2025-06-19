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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers'],
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