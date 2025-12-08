import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      buffer: 'buffer/',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util/',
      crypto: 'crypto-browserify',
      assert: 'assert/',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify',
      url: 'url/',
      path: 'path-browserify',
    }
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    global: 'globalThis',
  },
})