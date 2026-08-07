import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const apiProxyTarget =
  process.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@dropvid/shared': resolve(__dirname, '../../packages/shared/src'),
      '@dropvid/ui': resolve(__dirname, '../../packages/ui/src'),
      '@dropvid/account': resolve(__dirname, '../../packages/account/src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/__api__': {
        target: apiProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__api__/, '')
      }
    }
  }
})
