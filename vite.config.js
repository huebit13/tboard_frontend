import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util/',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    }
  },

  define: {
    'process.env': process.env,
    global: 'globalThis',
  },

  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})