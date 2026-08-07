/**
 * @file 历史统计 Hook
 * @author qiangcan
 * @date 2026-08-07
 */

import { useCallback, useEffect, useState } from 'react'
import { fetchHistoryStats, type CloudUserStats } from '../api/stats'
import { useAuth } from '../auth/AuthProvider'

export function useHistoryStats(initialDays = 14): {
  stats: CloudUserStats | null
  loading: boolean
  error: string | null
  rangeDays: number
  setRangeDays: (days: number) => void
  reload: () => Promise<void>
} {
  const { session } = useAuth()
  const [stats, setStats] = useState<CloudUserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rangeDays, setRangeDays] = useState(initialDays)

  const reload = useCallback(async (): Promise<void> => {
    if (!session) {
      setStats(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHistoryStats(session.accessToken, session.sessionId, rangeDays)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载统计失败')
    } finally {
      setLoading(false)
    }
  }, [session, rangeDays])

  useEffect(() => {
    void reload()
  }, [reload])

  return { stats, loading, error, rangeDays, setRangeDays, reload }
}
