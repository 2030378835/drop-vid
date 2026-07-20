import { motion } from 'framer-motion'
import {
  VERSION,
  MAC_DOWNLOADS,
  WIN_DOWNLOAD,
  hasAnyDownload,
  isDownloadReady
} from '../../config/downloads'
import section from '../Section/Section.module.css'
import styles from './DownloadSection.module.css'

export function DownloadSection(): React.JSX.Element {
  const ready = hasAnyDownload()
  const winReady = isDownloadReady(WIN_DOWNLOAD.href)

  return (
    <section className={`${section.section} ${styles.wrap}`} id="download">
      <p className={section.kicker}>下载</p>
      <h2 className={section.title}>获取 DropVid</h2>
      <p className={section.desc}>
        当前为内测版 v{VERSION}。请选择与你的系统匹配的安装包。
      </p>

      <h3 className={styles.groupTitle}>macOS</h3>
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

      <h3 className={styles.groupTitle}>Windows</h3>
      <div className={`${styles.actions} ${styles.actionsSingle}`}>
        <motion.a
          className={winReady ? styles.primary : styles.secondary}
          href={winReady ? WIN_DOWNLOAD.href : undefined}
          aria-disabled={!winReady}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.12 }}
          onClick={(event) => {
            if (!winReady) event.preventDefault()
          }}
        >
          <strong>{WIN_DOWNLOAD.label}</strong>
          <span>{WIN_DOWNLOAD.detail}</span>
        </motion.a>
      </div>

      <p className={styles.note}>
        {ready
          ? 'macOS：打开 dmg，将 DropVid 拖入「应用程序」。Windows：运行 .exe 安装程序并按向导完成安装。'
          : '安装包链接尚未配置：请编辑 src/config/downloads.ts 填入正式地址。'}
      </p>
    </section>
  )
}
