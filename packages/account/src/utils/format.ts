/**
 * @file 账户页格式化工具
 * @author qiangcan
 * @date 2026-08-07
 */

/** 格式化配额上限 */
export function formatQuotaLimit(limit: number): string {
  if (limit < 0) return '不限'
  return String(limit)
}

/** 格式化短日期 M/D */
export function formatShortDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** 格式化完整日期时间 */
export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** 邮箱前缀作显示名 */
export function emailDisplayName(email: string): string {
  const local = email.split('@')[0]?.trim()
  if (!local) return email
  return local.replace(/[._-]+/g, ' ')
}

/** 文件大小 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/** 时长秒 → mm:ss */
export function formatDuration(sec?: number): string {
  if (!sec || sec <= 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
