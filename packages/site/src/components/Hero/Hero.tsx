import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { motion } from 'framer-motion'
import logo from '../../assets/logo.png'
import heroShot from '../../assets/imgs/hero.png'
import {
  getDownloadByArch,
  isDownloadReady,
  startDownload,
  type DownloadArch
} from '../../config/downloads'
import { useLatestDownloads } from '../../hooks/useLatestDownloads'
import { detectMacArch } from '../../utils/detectMacArch'
import { detectClientPlatform, type ClientPlatform } from '../../utils/detectClientPlatform'
import { Icon } from '@dropvid/ui'
import styles from './Hero.module.css'

const LEAD_COPY: Record<ClientPlatform, string> = {
  mac: '为 macOS 打造的桌面视频下载工具。粘贴公开链接，选择清晰度，保存到本地。',
  windows: '为 Windows 打造的桌面视频下载工具。粘贴公开链接，选择清晰度，保存到本地。',
  other: '面向 macOS 与 Windows 的桌面视频下载工具。粘贴公开链接，即可保存到本地。'
}

export function Hero(): JSX.Element {
  const { loading, downloads } = useLatestDownloads()
  const { version, macDownloads, winDownload } = downloads

  const [platform] = useState<ClientPlatform>(() => detectClientPlatform())
  const [arch, setArch] = useState<DownloadArch>('arm64')
  const [archReady, setArchReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const splitRef = useRef<HTMLDivElement>(null)

  const isWindows = platform === 'windows'
  const isMac = platform === 'mac'

  useEffect(() => {
    if (!isMac) {
      setArchReady(true)
      return
    }

    let cancelled = false
    void detectMacArch().then((detected) => {
      if (!cancelled) {
        setArch(detected)
        setArchReady(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [isMac])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: MouseEvent): void => {
      if (!splitRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const selected = useMemo(() => getDownloadByArch(macDownloads, arch), [macDownloads, arch])
  const macCanDownload = Boolean(selected && isDownloadReady(selected.href))
  const winCanDownload = isDownloadReady(winDownload.href)
  const versionLabel = selected ? `.dmg (${selected.label})` : '.dmg'

  return (
    <section className={styles.hero}>
      {/* 右侧绝对定位大图，作为背景视觉层 */}
      <motion.figure
        className={styles.shot}
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={heroShot}
          alt="DropVid 客户端首页：粘贴链接并查看下载任务"
          width={1600}
          height={1000}
          decoding="async"
        />
      </motion.figure>

      <div className={`layout ${styles.inner}`}>
        <div className={styles.copy}>
          <motion.div
            className={styles.brandRow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={logo} alt="" width={56} height={56} className={styles.mark} aria-hidden />
            <p className={styles.product}>DropVid</p>
          </motion.div>

          <motion.h1
            className={styles.headline}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            丢入链接，即刻拥有视频
          </motion.h1>

          <motion.p
            className={styles.lead}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            {LEAD_COPY[platform]}
          </motion.p>

          <motion.div
            className={styles.actions}
            aria-label="下载"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            {isWindows ? (
              <button
                type="button"
                className={styles.primary}
                disabled={loading || !winCanDownload}
                onClick={() => startDownload(winDownload.href)}
              >
                <Icon name="download" size={16} />
                <span>{loading ? '加载中…' : '下载 Windows 版'}</span>
              </button>
            ) : (
              <div
                className={`${styles.split} ${!macCanDownload || loading ? styles.splitDisabled : ''}`}
                ref={splitRef}
              >
                <button
                  type="button"
                  className={styles.splitAction}
                  disabled={loading || !macCanDownload}
                  onClick={() => {
                    if (selected) startDownload(selected.href)
                  }}
                >
                  <Icon name="download" size={15} />
                  <span>{loading ? '加载中…' : '下载'}</span>
                </button>
                <span className={styles.splitDivider} aria-hidden />
                <button
                  type="button"
                  className={styles.splitMenuBtn}
                  disabled={loading || !archReady}
                  aria-haspopup="listbox"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <span className={styles.splitVersion}>{versionLabel}</span>
                  <svg className={styles.chevron} viewBox="0 0 12 8" aria-hidden>
                    <path d="M1.2.8 6 5.6 10.8.8 12 2 6 8 0 2z" fill="currentColor" />
                  </svg>
                </button>

                {menuOpen ? (
                  <ul className={styles.menu} role="listbox" aria-label="选择 macOS 版本">
                    {macDownloads.map((item) => {
                      const enabled = isDownloadReady(item.href)
                      return (
                        <li key={item.arch} role="option" aria-selected={item.arch === arch}>
                          <button
                            type="button"
                            className={`${styles.menuItem} ${item.arch === arch ? styles.menuItemActive : ''}`}
                            disabled={!enabled}
                            onClick={() => {
                              setArch(item.arch)
                              setMenuOpen(false)
                            }}
                          >
                            <strong>.dmg ({item.label})</strong>
                            <span>{item.detail}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </div>
            )}

            <a className={styles.secondary} href="#how">
              了解用法
            </a>
          </motion.div>

          <motion.p
            className={styles.trust}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.22 }}
          >
            {loading
              ? '正在获取最新版本…'
              : `游客可直接试用 · 免费版登录同步 · 当前 v${version}`}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
