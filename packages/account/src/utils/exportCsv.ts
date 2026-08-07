/**
 * @file CSV 导出
 * @author qiangcan
 * @date 2026-08-07
 */

import type { CloudHistoryItem } from '../api/history'
import type { CloudUserStats } from '../api/stats'
import { formatDateTime, formatDuration, formatFileSize } from './format'
import { platformLabel } from './platformLabels'

function escapeCell(value: string | number | boolean | undefined | null): string {
  const text = value == null ? '' : String(value)
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function downloadCsv(filename: string, rows: string[][]): void {
  const bom = '\uFEFF'
  const body = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')
  const blob = new Blob([bom + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/** 导出每日下载趋势 */
export function exportDailyTrendCsv(stats: CloudUserStats): void {
  const rows: string[][] = [['日期', '下载数']]
  for (const item of stats.dailyTrend) {
    rows.push([formatDateTime(item.dayStart).slice(0, 10), String(item.count)])
  }
  downloadCsv(`dropvid-daily-${Date.now()}.csv`, rows)
}

/** 导出平台分布 */
export function exportPlatformStatsCsv(stats: CloudUserStats): void {
  const rows: string[][] = [['平台', '下载数']]
  for (const item of stats.platformStats) {
    rows.push([platformLabel(item.platformId), String(item.value)])
  }
  downloadCsv(`dropvid-platforms-${Date.now()}.csv`, rows)
}

/** 导出云端历史明细 */
export function exportHistoryCsv(items: CloudHistoryItem[]): void {
  const rows: string[][] = [
    ['标题', '文件名', '平台', '作者', '时长', '大小', '完成时间', '链接']
  ]
  for (const item of items) {
    rows.push([
      item.title || '',
      item.fileName,
      platformLabel(item.platformId || 'generic'),
      item.author || '',
      formatDuration(item.duration),
      formatFileSize(item.fileSize),
      formatDateTime(item.completedAt),
      item.url || ''
    ])
  }
  downloadCsv(`dropvid-history-${Date.now()}.csv`, rows)
}
