/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 项目站需带仓库名；本地开发默认 '/'
const base = process.env.VITE_BASE || '/'

const GITEE_CDN_PATH =
  '/qq2057187934/push-drop-vid/raw/master/update/latest.json'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    // 本地 dev 通过代理读 Gitee CDN（浏览器直连会因 CORS / 302 失败）
    proxy: {
      '/__gitee__/update/latest.json': {
        target: 'https://raw.giteeusercontent.com',
        changeOrigin: true,
        rewrite: () => GITEE_CDN_PATH
      }
    }
  }
})
