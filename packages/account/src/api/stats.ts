/**
 * @file 统计 API
 * @author qiangcan
 * @date 2026-08-07
 */

import { accountFetch } from './client'

export type CloudUserStats = {
  totalCompleted: number
  starredCount: number
  thisWeekCount: number
  periodCompleted: number
  periodStarred: number
  platformStats: Array<{ platformId: string; value: number }>
  dailyTrend: Array<{ dayStart: number; count: number }>
}

export async function fetchHistoryStats(
  accessToken: string,
  sessionId: string | undefined,
  days = 14
): Promise<CloudUserStats> {
  const tzOffset = new Date().getTimezoneOffset()
  const query = new URLSearchParams({
    days: String(days),
    tzOffset: String(tzOffset)
  })
  const data = await accountFetch<{ ok: true; stats: CloudUserStats }>(
    `/api/v1/history/stats?${query}`,
    { token: accessToken, sessionId }
  )
  return data.stats
}
