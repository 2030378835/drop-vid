/** Gitee 发布仓（与 crazy-dropVid / push-drop-vid 共用） */
export const GITEE_UPDATE = {
  owner: 'qq2057187934',
  repo: 'push-drop-vid',
  /** push-drop-vid 默认分支为 master（main 会 404） */
  branch: 'master',
  latestManifestPath: 'update/latest.json'
} as const

/**
 * Gitee CDN 直链（无 302；仅供 CI / 脚本同步，浏览器跨域无 ACAO 不可直接 fetch）
 */
export function giteeCdnManifestUrl(): string {
  const { owner, repo, branch, latestManifestPath } = GITEE_UPDATE
  return `https://raw.giteeusercontent.com/${owner}/${repo}/raw/${branch}/${latestManifestPath}`
}

/** 官网运行时读取：同域 public/update/latest.json（避免 Gitee CORS / 302） */
export function siteManifestUrl(baseUrl: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}update/latest.json`
}

/** 本地 dev：Vite 代理到 Gitee CDN，绕过浏览器 CORS */
export const DEV_GITEE_PROXY_PATH = '/__gitee__/update/latest.json'
