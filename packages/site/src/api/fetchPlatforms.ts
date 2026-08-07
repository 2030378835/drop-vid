import { resolveApiBaseUrl, siteConfigUrl } from '@dropvid/shared'
import type { PublicPlatformItem, PublicPlatformsResponse } from '@dropvid/shared'
import { FALLBACK_PLATFORMS } from '../config/fallbackPlatforms'
import { fetchJson } from '@dropvid/shared'

let platformsPromise: Promise<PublicPlatformItem[]> | null = null

function isPlatformsPayload(data: unknown): data is PublicPlatformsResponse {
  if (!data || typeof data !== 'object') return false
  const items = (data as PublicPlatformsResponse).items
  return Array.isArray(items)
}

function platformsUrls(): string[] {
  const live = `${resolveApiBaseUrl()}/api/v1/config/platforms`
  const baked = siteConfigUrl(import.meta.env.BASE_URL, 'platforms.json')
  // 开发优先实时 API；生产优先同域静态（避免 HTTPS→HTTP 混合内容）
  return import.meta.env.DEV ? [live, baked] : [baked, live]
}

async function fetchPlatformsOnce(): Promise<PublicPlatformItem[]> {
  for (const url of platformsUrls()) {
    const data = await fetchJson<PublicPlatformsResponse>(url)
    if (data && isPlatformsPayload(data) && data.items.length > 0) {
      return data.items
    }
  }

  console.warn('[DropVid] platforms config unavailable, using fallback')
  return FALLBACK_PLATFORMS
}

/** 拉取启用中的平台列表（API → 同域兜底 → 本地常量） */
export function fetchPlatforms(): Promise<PublicPlatformItem[]> {
  if (!platformsPromise) {
    platformsPromise = fetchPlatformsOnce()
  }
  return platformsPromise
}
