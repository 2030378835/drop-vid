import { motion } from 'framer-motion'
import { hasAnyDownload, isDownloadReady } from '../../config/downloads'
import { useLatestDownloads } from '../../hooks/useLatestDownloads'
import section from '../Section/Section.module.css'
import styles from './DownloadSection.module.css'

export function DownloadSection(): React.JSX.Element {
  const { loading, fromRemote, downloads } = useLatestDownloads()
  const { version, notes, macDownloads, winDownload } = downloads
  const ready = hasAnyDownload(downloads)
  const winReady = isDownloadReady(winDownload.href)

  const desc = notes
    ? notes
    : `当前为内测版 v${version}。请选择与你的系统匹配的安装包。`

  return (
    <section className={`${section.section} ${styles.wrap}`} id="download">
      <p className={section.kicker}>下载</p>
      <h2 className={section.title}>获取 DropVid</h2>
      <p className={section.desc}>{loading ? '正在获取最新版本信息…' : desc}</p>

      <h3 className={styles.groupTitle}>macOS</h3>
      <div className={styles.actions}>
        {macDownloads.map((item, index) => {
          const enabled = !loading && isDownloadReady(item.href)
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
          className={winReady && !loading ? styles.primary : styles.secondary}
          href={winReady && !loading ? winDownload.href : undefined}
          aria-disabled={!winReady || loading}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.12 }}
          onClick={(event) => {
            if (!winReady || loading) event.preventDefault()
          }}
        >
          <strong>{winDownload.label}</strong>
          <span>{winDownload.detail}</span>
        </motion.a>
      </div>

      <p className={styles.note}>
        {loading
          ? '请稍候…'
          : ready
            ? `下载后请查看下方「安装说明」，了解 Mac / Windows 首次启动时的系统安全提示如何处理。${fromRemote ? '' : '（当前使用本地兜底链接）'}`
            : '暂未获取到安装包链接，请检查网络后刷新页面。'}
      </p>
    </section>
  )
}
