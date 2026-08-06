/** 生产环境默认 API（与客户端打包地址对齐；HTTPS 页面可能因混合内容失败） */
export const PRODUCTION_API_BASE_URL = 'http://192.144.171.10:3000'

/** 开发默认 API */
export const DEVELOPMENT_API_BASE_URL = 'http://localhost:3000'

/** 本地 dev：Vite 代理前缀，绕过 CORS */
export const DEV_API_PROXY_PREFIX = '/__api__'

/**
 * 运行时优先的 API 根地址。
 * - 开发：走 Vite 代理
 * - 生产：优先 VITE_API_BASE_URL，否则生产 IP（可能被浏览器混合内容拦截）
 */
export function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  if (import.meta.env.DEV) return DEV_API_PROXY_PREFIX
  return PRODUCTION_API_BASE_URL
}

/** 同域兜底配置（CI 从服务端同步，避免 GitHub Pages 混合内容） */
export function siteConfigUrl(baseUrl: string, file: 'platforms.json' | 'limits.json'): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}config/${file}`
}
