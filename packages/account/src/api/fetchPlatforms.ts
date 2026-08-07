/**
 * @file 平台字典 API
 * @description 拉取服务端平台配置（含 iconUrl），与官网同源
 * @author qiangcan
 * @date 2026-08-07
 */

import {
  fetchJson,
  resolveApiBaseUrl,
  siteConfigUrl,
  type PublicPlatformItem,
  type PublicPlatformsResponse
} from '@dropvid/shared'
import { FALLBACK_PLATFORMS } from '../config/fallbackPlatforms'

let platformsPromise: Promise<PublicPlatformItem[]> | null = null

function isPlatformsPayload(data: unknown): data is PublicPlatformsResponse {
  if (!data || typeof data !== 'object') return false
  const items = (data as PublicPlatformsResponse).items
  return Array.isArray(items)
}

function platformsUrls(): string[] {
  const live = `${resolveApiBaseUrl()}/api/v1/config/platforms`
  const baked = siteConfigUrl(import.meta.env.BASE_URL, 'platforms.json')
  return import.meta.env.DEV ? [live, baked] : [baked, live]
}

async function fetchPlatformsOnce(): Promise<PublicPlatformItem[]> {
  for (const url of platformsUrls()) {
    try {
      const data = await fetchJson<PublicPlatformsResponse>(url)
      if (data && isPlatformsPayload(data) && data.items.length > 0) {
        return data.items
      }
    } catch {
      // 尝试下一个来源
    }
  }

  console.warn('[DropVid account] platforms config unavailable, using fallback')
  return FALLBACK_PLATFORMS
}

/** 拉取启用中的平台列表（API → 同域兜底 → 本地常量） */
export function fetchPlatforms(): Promise<PublicPlatformItem[]> {
  if (!platformsPromise) {
    platformsPromise = fetchPlatformsOnce()
  }
  return platformsPromise
}
