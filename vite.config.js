import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { resolve as pathResolve } from 'node:path'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': pathResolve(rootDir, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['exceljs/dist/exceljs.min.js', 'file-saver'],
  },
})
