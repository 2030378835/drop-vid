import type { DurationBucket } from '../types/cloudConfig'

/** 服务端 limit=-1 表示无限制 */
export function isUnlimitedLimit(limit: number | undefined): boolean {
  return limit === -1
}

function formatDurationLabel(seconds: number): string {
  if (seconds < 60) return `${seconds} 秒`
  const minutes = Math.floor(seconds / 60)
  const rem = seconds % 60
  return rem > 0 ? `${minutes} 分 ${rem} 秒` : `${minutes} 分钟`
}

/** 单条可下载最长时长提示，如「≤3 分钟」；不限返回 null */
export function formatDurationCapHint(buckets?: DurationBucket[]): string | null {
  if (!buckets?.length) return null
  if (buckets.some((b) => b.maxSec === -1 && b.dailyLimit !== 0)) return null
  const finite = buckets.filter((b) => b.maxSec >= 0 && b.dailyLimit !== 0)
  if (!finite.length) return null
  const maxSec = Math.max(...finite.map((b) => b.maxSec))
  return `≤${formatDurationLabel(maxSec)}`
}

export function formatQuotaMain(limit: number): string {
  return isUnlimitedLimit(limit) ? '无限' : `${limit} 次`
}
