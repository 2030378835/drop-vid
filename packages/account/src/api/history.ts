/**
 * @file 历史 API
 * @author qiangcan
 * @date 2026-08-07
 */

import { accountFetch } from './client'

export type CloudHistoryItem = {
  clientId: string
  title?: string
  fileName: string
  fileSize?: number
  url?: string
  author?: string
  duration?: number
  platformId?: string
  starred?: boolean
  tags?: string[]
  quality?: string
  format?: string
  status: 'completed' | 'failed'
  completedAt: number
  updatedAt: number
}

export type CloudHistoryPageResult = {
  items: CloudHistoryItem[]
  total: number
  totalAll: number
  page: number
  limit: number
}

/** 分页拉取可浏览云端历史（服务端排序与筛选） */
export async function fetchCloudHistoryPage(
  accessToken: string,
  options: {
    page?: number
    limit?: number
    days?: number
    sessionId?: string
  } = {}
): Promise<CloudHistoryPageResult> {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 15),
    tzOffset: String(new Date().getTimezoneOffset())
  })
  if (options.days != null) {
    query.set('days', String(options.days))
  }

  return accountFetch<CloudHistoryPageResult & { ok: true }>(`/api/v1/history/list?${query}`, {
    token: accessToken,
    sessionId: options.sessionId
  })
}

/** 导出用：循环拉取全部已完成记录（上限 2000 条） */
export async function fetchAllCloudHistory(
  accessToken: string,
  sessionId?: string
): Promise<CloudHistoryItem[]> {
  const items: CloudHistoryItem[] = []
  let since = 0
  const pageSize = 500
  const maxItems = 2000

  while (items.length < maxItems) {
    const query = new URLSearchParams({
      since: String(since),
      limit: String(pageSize)
    })
    const data = await accountFetch<{
      ok: true
      items: CloudHistoryItem[]
      serverTime: number
    }>(`/api/v1/history/sync?${query}`, {
      token: accessToken,
      sessionId
    })

    if (data.items.length === 0) break
    items.push(...data.items)
    since = Math.max(...data.items.map((item) => item.updatedAt))
    if (data.items.length < pageSize) break
  }

  return items
    .filter((item) => item.status === 'completed')
    .sort((a, b) => b.completedAt - a.completedAt)
}
