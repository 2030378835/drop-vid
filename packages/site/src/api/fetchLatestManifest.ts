import {
  DEV_GITEE_PROXY_PATH,
  giteeCdnManifestUrl,
  siteManifestUrl
} from '../config/giteeUpdate'
import type { UpdateManifest } from '@dropvid/shared'

const FETCH_TIMEOUT_MS = 12_000

let manifestPromise: Promise<UpdateManifest | null> | null = null

function manifestFetchUrls(): string[] {
  const base = import.meta.env.BASE_URL
  const urls = [siteManifestUrl(base)]

  // 开发环境可通过 Vite 代理拉 Gitee 最新清单（生产环境 Gitee 无 CORS，不可直连）
  if (import.meta.env.DEV) {
    urls.push(DEV_GITEE_PROXY_PATH)
  }

  return urls
}

async function fetchManifestFromUrl(url: string): Promise<UpdateManifest | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store'
    })

    if (!res.ok) return null

    const data = (await res.json()) as UpdateManifest
    if (data?.version?.trim() || data?.downloads) {
      return data
    }
  } finally {
    window.clearTimeout(timer)
  }

  return null
}

async function fetchLatestManifestOnce(): Promise<UpdateManifest | null> {
  const urls = manifestFetchUrls()
  let lastError: unknown

  for (const url of urls) {
    try {
      const data = await fetchManifestFromUrl(url)
      if (data) return data
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    console.warn('[DropVid] fetch latest manifest failed', lastError)
  }
  return null
}

/**
 * 拉取最新版本清单。
 * 生产：同域 /drop-vid/update/latest.json（CI 从 Gitee 同步）
 * 开发：同域 public 文件，或 Vite 代理 Gitee CDN
 */
export function fetchLatestManifest(): Promise<UpdateManifest | null> {
  if (!manifestPromise) {
    manifestPromise = fetchLatestManifestOnce()
  }
  return manifestPromise
}

/** 供 CI / 脚本使用的 Gitee CDN 地址 */
export { giteeCdnManifestUrl }
