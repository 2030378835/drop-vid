import { latestManifestUrls } from '../config/giteeUpdate'
import type { UpdateManifest } from '../types/updateManifest'

const FETCH_TIMEOUT_MS = 12_000

let manifestPromise: Promise<UpdateManifest | null> | null = null

async function fetchLatestManifestOnce(): Promise<UpdateManifest | null> {
  const urls = latestManifestUrls()
  let lastError: unknown

  for (const url of urls) {
    try {
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
      const res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store'
      })
      window.clearTimeout(timer)

      if (!res.ok) continue

      const data = (await res.json()) as UpdateManifest
      if (data?.version?.trim() || data?.downloads) {
        return data
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    console.warn('[DropVid] fetch latest manifest failed', lastError)
  }
  return null
}

/** 从 Gitee raw 拉取最新版本清单；多 URL 依次尝试，同页只请求一次 */
export function fetchLatestManifest(): Promise<UpdateManifest | null> {
  if (!manifestPromise) {
    manifestPromise = fetchLatestManifestOnce()
  }
  return manifestPromise
}
