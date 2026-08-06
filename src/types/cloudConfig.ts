/** 时长桶：闭区间秒；maxSec=-1 无上限；dailyLimit=-1 不限 */
export type DurationBucket = {
  minSec: number
  maxSec: number
  dailyLimit: number
}

/** 公开平台单项（对齐 /api/v1/config/platforms） */
export type PublicPlatformItem = {
  name: string
  code: string
  helpKind?: string
  iconUrl?: string
  color?: string
  note?: string
  helpContent?: {
    summary?: string
    officialSite?: { label: string; url: string }
    exampleUrls?: Array<{ label: string; url: string }>
    faq?: Array<{ q: string; a: string }>
  }
}

export type PublicPlatformsResponse = {
  ok: true
  items: PublicPlatformItem[]
}

/** 各档配额（对齐 /api/v1/config/limits；旧服务端可能缺字段） */
export type CloudLimitsConfig = {
  guest: {
    dailyDownload: number
    durationBuckets?: DurationBucket[]
    maxConcurrentDownloads?: number
  }
  free: {
    dailyDownload: number
    cloudHistory?: number
    durationBuckets?: DurationBucket[]
    maxDevices?: number
    maxConcurrentDownloads?: number
  }
  pro: {
    dailyDownload: number
    cloudHistory?: number
    durationBuckets?: DurationBucket[]
    maxDevices?: number
    maxConcurrentDownloads?: number
  }
}

export type PublicLimitsResponse = {
  ok: true
  limits: CloudLimitsConfig
}

/** 与服务端默认对齐的兜底配额 */
export const DEFAULT_LIMITS: CloudLimitsConfig = {
  guest: {
    dailyDownload: 5,
    durationBuckets: [{ minSec: 0, maxSec: 180, dailyLimit: 4 }],
    maxConcurrentDownloads: 1
  },
  free: {
    dailyDownload: 10,
    cloudHistory: 50,
    durationBuckets: [{ minSec: 0, maxSec: 300, dailyLimit: 9 }],
    maxDevices: 1,
    maxConcurrentDownloads: 1
  },
  pro: {
    dailyDownload: -1,
    cloudHistory: -1,
    durationBuckets: [{ minSec: 0, maxSec: -1, dailyLimit: -1 }],
    maxDevices: 3,
    maxConcurrentDownloads: 3
  }
}
