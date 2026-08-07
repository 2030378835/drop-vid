import { resolveApiBaseUrl, siteConfigUrl } from '@dropvid/shared'
import {
  DEFAULT_LIMITS,
  type CloudLimitsConfig,
  type PublicLimitsResponse
} from '@dropvid/shared'
import { fetchJson } from '@dropvid/shared'

let limitsPromise: Promise<CloudLimitsConfig> | null = null

function isLimitsPayload(data: unknown): data is PublicLimitsResponse {
  if (!data || typeof data !== 'object') return false
  const limits = (data as PublicLimitsResponse).limits
  return Boolean(limits?.guest && limits?.free && limits?.pro)
}

/** 旧服务端可能缺字段，用默认值补齐 */
function mergeLimits(partial: CloudLimitsConfig): CloudLimitsConfig {
  return {
    guest: {
      ...DEFAULT_LIMITS.guest,
      ...partial.guest,
      durationBuckets:
        partial.guest.durationBuckets ?? DEFAULT_LIMITS.guest.durationBuckets,
      maxConcurrentDownloads:
        partial.guest.maxConcurrentDownloads ??
        DEFAULT_LIMITS.guest.maxConcurrentDownloads
    },
    free: {
      ...DEFAULT_LIMITS.free,
      ...partial.free,
      cloudHistory: partial.free.cloudHistory ?? DEFAULT_LIMITS.free.cloudHistory,
      durationBuckets:
        partial.free.durationBuckets ?? DEFAULT_LIMITS.free.durationBuckets,
      maxDevices: partial.free.maxDevices ?? DEFAULT_LIMITS.free.maxDevices,
      maxConcurrentDownloads:
        partial.free.maxConcurrentDownloads ??
        DEFAULT_LIMITS.free.maxConcurrentDownloads
    },
    pro: {
      ...DEFAULT_LIMITS.pro,
      ...partial.pro,
      cloudHistory: partial.pro.cloudHistory ?? DEFAULT_LIMITS.pro.cloudHistory,
      durationBuckets:
        partial.pro.durationBuckets ?? DEFAULT_LIMITS.pro.durationBuckets,
      maxDevices: partial.pro.maxDevices ?? DEFAULT_LIMITS.pro.maxDevices,
      maxConcurrentDownloads:
        partial.pro.maxConcurrentDownloads ??
        DEFAULT_LIMITS.pro.maxConcurrentDownloads
    }
  }
}

function limitsUrls(): string[] {
  const live = `${resolveApiBaseUrl()}/api/v1/config/limits`
  const baked = siteConfigUrl(import.meta.env.BASE_URL, 'limits.json')
  return import.meta.env.DEV ? [live, baked] : [baked, live]
}

async function fetchLimitsOnce(): Promise<CloudLimitsConfig> {
  for (const url of limitsUrls()) {
    const data = await fetchJson<PublicLimitsResponse>(url)
    if (data && isLimitsPayload(data)) {
      return mergeLimits(data.limits)
    }
  }

  console.warn('[DropVid] limits config unavailable, using fallback')
  return DEFAULT_LIMITS
}

/** 拉取三档配额（API → 同域兜底 → 本地默认） */
export function fetchLimits(): Promise<CloudLimitsConfig> {
  if (!limitsPromise) {
    limitsPromise = fetchLimitsOnce()
  }
  return limitsPromise
}
