import { motion } from 'framer-motion'
import {
  APP_VERSION,
  MAC_DOWNLOADS,
  hasAnyDownload,
  isDownloadReady
} from '../config/downloads'
import section from './Section.module.css'
import styles from './DownloadSection.module.css'

export function DownloadSection(): React.JSX.Element {
  const ready = hasAnyDownload()

  return (
    <section className={`${section.section} ${styles.wrap}`} id="download">
      <p className={section.kicker}>下载</p>
      <h2 className={section.title}>获取 DropVid for macOS</h2>
      <p className={section.desc}>
        当前为内测版 v{APP_VERSION}。请选择与芯片匹配的安装包。
      </p>

      <div className={styles.actions}>
        {MAC_DOWNLOADS.map((item, index) => {
          const enabled = isDownloadReady(item.href)
          return (
            <motion.a
              key={item.arch}
              className={item.primary ? styles.primary : styles.secondary}
              href={enabled ? item.href : undefined}
              aria-disabled={!enabled}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              onClick={(event) => {
                if (!enabled) event.preventDefault()
              }}
            >
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </motion.a>
          )
        })}
      </div>
      <p className={styles.note}>
        {ready
          ? '下载后打开 dmg，将 DropVid 拖入「应用程序」即可。'
          : '安装包链接尚未配置：请编辑 src/config/downloads.ts 填入正式地址。'}
      </p>
    </section>
  )
}
