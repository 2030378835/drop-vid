/// <reference types="node" />
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 项目站需带仓库名；本地开发默认 '/'
const base = process.env.VITE_BASE || '/'

const GITEE_CDN_PATH =
  '/qq2057187934/push-drop-vid/raw/master/update/latest.json'

const apiProxyTarget =
  process.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

/** GitHub Pages 深链回退：/pricing 刷新时走 404.html → SPA */
function spaFallback404(): Plugin {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const indexHtml = resolve(__dirname, 'dist/index.html')
      const fallbackHtml = resolve(__dirname, 'dist/404.html')
      if (existsSync(indexHtml)) {
        copyFileSync(indexHtml, fallbackHtml)
      }
    }
  }
}

export default defineConfig({
  base,
  plugins: [react(), spaFallback404()],
  resolve: {
    alias: {
      '@dropvid/shared': resolve(__dirname, 'packages/shared/src'),
      '@dropvid/ui': resolve(__dirname, 'packages/ui/src'),
      '@dropvid/account': resolve(__dirname, 'packages/account/src'),
      '@dropvid/site': resolve(__dirname, 'packages/site/src')
    }
  },
  server: {
    // 本地 dev 通过代理读 Gitee CDN（浏览器直连会因 CORS / 302 失败）
    // 以及代理云端配置 API，避免跨域
    proxy: {
      '/__gitee__/update/latest.json': {
        target: 'https://raw.giteeusercontent.com',
        changeOrigin: true,
        rewrite: () => GITEE_CDN_PATH
      },
      '/__api__': {
        target: apiProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__api__/, '')
      }
    }
  }
})
