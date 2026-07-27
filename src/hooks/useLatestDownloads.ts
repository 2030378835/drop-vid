import { useEffect, useState } from 'react'
import { fetchLatestManifest } from '../api/fetchLatestManifest'
import {
  buildFallbackDownloads,
  downloadsFromManifest,
  type SiteDownloads
} from '../config/downloads'

export type LatestDownloadsState = {
  loading: boolean
  /** true 表示数据来自 Gitee；false 表示用了本地兜底 */
  fromRemote: boolean
  downloads: SiteDownloads
}

export function useLatestDownloads(): LatestDownloadsState {
  const [state, setState] = useState<LatestDownloadsState>(() => ({
    loading: true,
    fromRemote: false,
    downloads: buildFallbackDownloads()
  }))

  useEffect(() => {
    let cancelled = false

    void fetchLatestManifest().then((manifest) => {
      if (cancelled) return

      if (manifest) {
        setState({
          loading: false,
          fromRemote: true,
          downloads: downloadsFromManifest(manifest)
        })
        return
      }

      setState({
        loading: false,
        fromRemote: false,
        downloads: buildFallbackDownloads()
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
