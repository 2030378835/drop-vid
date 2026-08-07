/**
 * @file 平台字典 Provider
 * @description 账户区启动时拉取 /config/platforms，供 Logo 与展示名使用
 * @author qiangcan
 * @date 2026-08-07
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode
} from 'react'
import type { PublicPlatformItem } from '@dropvid/shared'
import { fetchPlatforms } from '../api/fetchPlatforms'
import { setPlatformCatalog } from './platformCatalog'

type PlatformCatalogContextValue = {
  items: PublicPlatformItem[]
  ready: boolean
}

const PlatformCatalogContext = createContext<PlatformCatalogContextValue>({
  items: [],
  ready: false
})

type Props = {
  children: ReactNode
}

export function PlatformCatalogProvider({ children }: Props): JSX.Element {
  const [items, setItems] = useState<PublicPlatformItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetchPlatforms().then((loaded) => {
      if (cancelled) return
      setItems(loaded)
      setPlatformCatalog(loaded)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => ({ items, ready }), [items, ready])

  return (
    <PlatformCatalogContext.Provider value={value}>{children}</PlatformCatalogContext.Provider>
  )
}

/** 订阅平台字典，字典加载完成后会触发重渲染 */
export function usePlatformCatalog(): PlatformCatalogContextValue {
  return useContext(PlatformCatalogContext)
}
