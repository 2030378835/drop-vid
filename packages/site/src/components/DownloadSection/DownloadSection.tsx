import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { hasAnyDownload, isDownloadReady, startDownload } from '../../config/downloads'
import { useLatestDownloads } from '../../hooks/useLatestDownloads'
import { detectClientPlatform } from '../../utils/detectClientPlatform'
import { Icon } from '@dropvid/ui'
import styles from './DownloadSection.module.css'

export function DownloadSection(): React.JSX.Element {
  const { loading, fromRemote, downloads } = useLatestDownloads()
  const { version, notes, macDownloads, winDownload } = downloads
  const [platform] = useState(() => detectClientPlatform())
  const ready = hasAnyDownload(downloads)
  const winReady = !loading && isDownloadReady(winDownload.href)
  const preferMac = platform !== 'windows'
  const preferWin = platform === 'windows'

  const desc = notes?.trim()
    ? notes
    : `当前内测版 v${version}。选择系统安装包即可开始，游客可直接试用。`

  return (
    <section className={styles.wrap} id="download">
      <div className={`layout ${styles.inner}`}>
        <header className={styles.head}>
          <p className={styles.kicker}>下载</p>
          <h2 className={styles.title}>开始使用 DropVid</h2>
          <p className={styles.desc}>{loading ? '正在获取最新版本信息…' : desc}</p>
        </header>

        <div className={styles.panels}>
          <motion.article
            className={`${styles.panel} ${preferMac ? styles.panelActive : ''}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.panelTop}>
              <span className={styles.panelIcon} aria-hidden>
                <Icon name="mac" size={22} />
              </span>
              <div className={styles.panelMeta}>
                <div className={styles.panelTitleRow}>
                  <h3>macOS</h3>
                  {preferMac ? <span className={styles.badge}>当前系统</span> : null}
                </div>
                <p>Apple Silicon / Intel · .dmg</p>
              </div>
            </div>

            <div className={styles.optionList}>
              {macDownloads.map((item) => {
                const enabled = !loading && isDownloadReady(item.href)
                return (
                  <button
                    key={item.arch}
                    type="button"
                    className={`${styles.option} ${item.primary ? styles.optionPrimary : ''}`}
                    disabled={!enabled}
                    onClick={() => startDownload(item.href)}
                  >
                    <span className={styles.optionText}>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </span>
                    <Icon name="download" size={16} className={styles.optionIcon} />
                  </button>
                )
              })}
            </div>
          </motion.article>

          <motion.article
            className={`${styles.panel} ${preferWin ? styles.panelActive : ''}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.4, delay: 0.06 }}
          >
            <div className={styles.panelTop}>
              <span className={styles.panelIcon} aria-hidden>
                <Icon name="windows" size={22} />
              </span>
              <div className={styles.panelMeta}>
                <div className={styles.panelTitleRow}>
                  <h3>Windows</h3>
                  {preferWin ? <span className={styles.badge}>当前系统</span> : null}
                </div>
                <p>Windows 10 / 11 · .exe</p>
              </div>
            </div>

            <div className={styles.optionList}>
              <button
                type="button"
                className={`${styles.option} ${styles.optionPrimary} ${styles.optionTall}`}
                disabled={!winReady}
                onClick={() => startDownload(winDownload.href)}
              >
                <span className={styles.optionText}>
                  <strong>{loading ? '加载中…' : '下载安装包'}</strong>
                  <span>{winDownload.detail}</span>
                </span>
                <Icon name="download" size={16} className={styles.optionIcon} />
              </button>
            </div>
          </motion.article>
        </div>

        <div className={styles.foot}>
          <p className={styles.note}>
            {loading
              ? '请稍候…'
              : ready
                ? `下载后请查看下方安装说明。${fromRemote ? '' : '（当前使用本地兜底链接）'}`
                : '暂未获取到安装包链接，请检查网络后刷新页面。'}
          </p>
          <Link className={styles.pricingLink} to="/pricing">
            查看定价方案
            <Icon name="tag" size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
