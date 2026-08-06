import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchPlatforms } from '../../api/fetchPlatforms'
import { FALLBACK_PLATFORMS } from '../../config/fallbackPlatforms'
import type { PublicPlatformItem } from '../../types/cloudConfig'
import {
  filterMarketingPlatforms,
  localPlatformIcon,
  platformNote
} from '../../utils/platformDisplay'
import section from '../Section/Section.module.css'
import styles from './Platforms.module.css'

/** 折叠态最多展示数量（刚好两行 × 4 列） */
const PREVIEW_COUNT = 8

type DisplayPlatform = {
  code: string
  name: string
  note: string
  iconUrl?: string
  localIcon?: string
}

function toDisplay(items: PublicPlatformItem[]): DisplayPlatform[] {
  return filterMarketingPlatforms(items).map((item) => ({
    code: item.code,
    name: item.name,
    note: platformNote(item),
    iconUrl: item.iconUrl?.trim() || undefined,
    localIcon: localPlatformIcon(item.code)
  }))
}

export function Platforms(): React.JSX.Element {
  const [platforms, setPlatforms] = useState<DisplayPlatform[]>(() =>
    toDisplay(FALLBACK_PLATFORMS)
  )
  const [ready, setReady] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetchPlatforms().then((items) => {
      if (cancelled) return
      setPlatforms(toDisplay(items))
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const cookieCount = platforms.filter((p) => p.note.includes('Cookie')).length
  const hasMore = platforms.length > PREVIEW_COUNT
  const visible = expanded || !hasMore ? platforms : platforms.slice(0, PREVIEW_COUNT)
  const hiddenCount = platforms.length - PREVIEW_COUNT

  return (
    <section className={`${section.section} ${styles.wrap}`} id="platforms">
      <p className={section.kicker}>平台</p>
      <h2 className={section.title}>覆盖日常最常用的视频来源</h2>
      <p className={section.desc}>
        {ready
          ? cookieCount > 0
            ? `列表由服务端实时同步。部分站点需导入浏览器 Cookie；不支持的平台不会出现在此。`
            : '列表由服务端实时同步，粘贴分享链接即可解析下载。'
          : '正在同步服务端平台配置…'}
      </p>

      <ul className={styles.list}>
        {visible.map((item, index) => (
          <motion.li
            key={item.code}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
          >
            <strong>
              {(item.iconUrl || item.localIcon) && (
                <img
                  width={24}
                  height={24}
                  src={item.iconUrl || item.localIcon}
                  alt=""
                  onError={(event) => {
                    const img = event.currentTarget
                    if (item.localIcon && img.src !== item.localIcon) {
                      img.src = item.localIcon
                      return
                    }
                    img.style.display = 'none'
                  }}
                />
              )}
              {item.name}
            </strong>
            <span>{item.note}</span>
          </motion.li>
        ))}

        {hasMore ? (
          <li className={styles.moreRow}>
            <button
              type="button"
              className={styles.moreBtn}
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? '收起' : `展示更多（还有 ${hiddenCount} 个）`}
            </button>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
