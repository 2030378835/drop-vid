/**
 * @file 云端历史分页 Hook
 * @description 按页从服务端拉取云同步记录
 * @author qiangcan
 * @date 2026-08-07
 */

import { useCallback, useEffect, useState } from 'react'
import { fetchCloudHistoryPage, type CloudHistoryItem } from '../api/history'
import { useAuth } from '../auth/AuthProvider'

export function useCloudHistoryPage(
  page: number,
  rangeDays: number,
  pageSize = 15
): {
  items: CloudHistoryItem[]
  total: number
  totalAll: number
  loading: boolean
  error: string | null
  reload: () => Promise<void>
} {
  const { session } = useAuth()
  const [items, setItems] = useState<CloudHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalAll, setTotalAll] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (): Promise<void> => {
    if (!session) {
      setItems([])
      setTotal(0)
      setTotalAll(0)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCloudHistoryPage(session.accessToken, {
        page,
        limit: pageSize,
        days: rangeDays,
        sessionId: session.sessionId
      })
      setItems(data.items)
      setTotal(data.total)
      setTotalAll(data.totalAll)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载历史记录失败')
    } finally {
      setLoading(false)
    }
  }, [session, page, pageSize, rangeDays])

  useEffect(() => {
    void reload()
  }, [reload])

  return { items, total, totalAll, loading, error, reload }
}
