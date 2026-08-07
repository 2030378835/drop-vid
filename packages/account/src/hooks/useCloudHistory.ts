/**
 * @file 云端历史 Hook
 * @description 拉取账户全部已完成云同步记录
 * @author qiangcan
 * @date 2026-08-07
 */

import { useCallback, useEffect, useState } from 'react'
import { fetchAllCloudHistory, type CloudHistoryItem } from '../api/history'
import { useAuth } from '../auth/AuthProvider'

export function useCloudHistory(): {
  items: CloudHistoryItem[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
} {
  const { session } = useAuth()
  const [items, setItems] = useState<CloudHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (): Promise<void> => {
    if (!session) {
      setItems([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllCloudHistory(session.accessToken, session.sessionId)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载历史记录失败')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    void reload()
  }, [reload])

  return { items, loading, error, reload }
}
