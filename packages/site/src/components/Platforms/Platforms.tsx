import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchPlatforms } from '../../api/fetchPlatforms'
import { FALLBACK_PLATFORMS } from '../../config/fallbackPlatforms'
import type { PublicPlatformItem } from '@dropvid/shared'
import {
  filterMarketingPlatforms,
  localPlatformIcon,
  platformNote
} from '../../utils/platformDisplay'
import { Icon } from '@dropvid/ui'
import styles from './Platforms.module.css'

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

  const hasMore = platforms.length > PREVIEW_COUNT
  const visible = expanded || !hasMore ? platforms : platforms.slice(0, PREVIEW_COUNT)
  const hiddenCount = platforms.length - PREVIEW_COUNT

  return (
    <section className={styles.wrap} id="platforms">
      <div className={`layout ${styles.inner}`}>
        <div className={styles.head}>
          <p className={styles.kicker}>平台</p>
          <h2 className={styles.title}>覆盖日常最常用的视频来源</h2>
          <p className={styles.desc}>
            {ready
              ? '列表由服务端同步。部分站点需导入浏览器 Cookie；不支持的平台不会出现在此。'
              : '正在同步服务端平台配置…'}
          </p>
        </div>

        <ul className={styles.logoStrip}>
          {visible.map((item, index) => (
            <motion.li
              key={item.code}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
            >
              <span className={styles.logoMark}>
                {(item.iconUrl || item.localIcon) && (
                  <img
                    width={28}
                    height={28}
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
              </span>
              <strong>{item.name}</strong>
              <span>{item.note}</span>
            </motion.li>
          ))}
        </ul>

        {hasMore ? (
          <button
            type="button"
            className={styles.moreBtn}
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            <Icon name={expanded ? 'chevronDown' : 'circlePlus'} size={16} />
            <span>{expanded ? '收起' : `展示更多（还有 ${hiddenCount} 个）`}</span>
          </button>
        ) : null}
      </div>
    </section>
  )
}
