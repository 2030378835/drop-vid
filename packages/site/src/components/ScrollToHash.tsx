import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** 路由切换后滚动到 location.hash 对应区块（React Router Link 不会自动锚点定位） */
export function ScrollToHash(): null {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.replace(/^#/, ''))
    if (!id) return

    const scroll = (): void => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // 跨路由进入首页时，等区块挂载再滚
    const frame = window.requestAnimationFrame(() => {
      if (document.getElementById(id)) {
        scroll()
        return
      }
      window.setTimeout(scroll, 80)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
