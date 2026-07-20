import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { motion } from 'framer-motion'
import logo from '../../assets/logo.png'
import {
  MAC_DOWNLOADS,
  WIN_DOWNLOAD,
  getDownloadByArch,
  isDownloadReady,
  startDownload,
  type DownloadArch
} from '../../config/downloads'
import { detectMacArch } from '../../utils/detectMacArch'
import { detectClientPlatform, type ClientPlatform } from '../../utils/detectClientPlatform'
import styles from './Hero.module.css'

const LEAD_COPY: Record<ClientPlatform, string> = {
  mac: '粘贴公开视频链接，选择清晰度，保存到本地。为 macOS 打造的极简下载工具。',
  windows: '粘贴公开视频链接，选择清晰度，保存到本地。为 Windows 打造的极简下载工具。',
  other: '粘贴公开视频链接，选择清晰度，保存到本地。支持 macOS 与 Windows 的极简下载工具。'
}

export function Hero(): JSX.Element {
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

  const selected = useMemo(() => getDownloadByArch(arch), [arch])
  const macCanDownload = Boolean(selected && isDownloadReady(selected.href))
  const winCanDownload = isDownloadReady(WIN_DOWNLOAD.href)
  const versionLabel = selected ? `.dmg (${selected.label})` : '.dmg'

  const downloadHint = isWindows
    ? winCanDownload
      ? '点击按钮下载 Windows 安装包（.exe）'
      : '下载链接尚未配置，请先填写 src/config/downloads.ts'
    : macCanDownload
      ? '点击左侧直接下载；右侧可切换 Apple Silicon / Intel'
      : '下载链接尚未配置，请先填写 src/config/downloads.ts'

  return (
    <section className={styles.hero}>
      <div className={`layout ${styles.grid}`}>
        <div className={styles.copy}>
          <motion.img
            src={logo}
            alt=""
            width={64}
            height={64}
            className={styles.mark}
            aria-hidden
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.h1
            className={styles.brand}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            DropVid
          </motion.h1>
          <motion.p
            className={styles.headline}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            丢入链接，即刻拥有视频
          </motion.p>
          <motion.p
            className={styles.lead}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            {LEAD_COPY[platform]}
          </motion.p>
        </div>

        <motion.aside
          className={styles.download}
          aria-label="下载"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.downloadLabel}>立即获取</p>

          {isWindows ? (
            <button
              type="button"
              className={styles.winDownload}
              disabled={!winCanDownload}
              onClick={() => startDownload(WIN_DOWNLOAD.href)}
            >
              下载 Windows 版
            </button>
          ) : (
            <div
              className={`${styles.split} ${!macCanDownload ? styles.splitDisabled : ''}`}
              ref={splitRef}
            >
              <button
                type="button"
                className={styles.splitAction}
                disabled={!macCanDownload}
                onClick={() => {
                  if (selected) startDownload(selected.href)
                }}
              >
                下载
              </button>
              <span className={styles.splitDivider} aria-hidden />
              <button
                type="button"
                className={styles.splitMenuBtn}
                disabled={!archReady}
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
                  {MAC_DOWNLOADS.map((item) => {
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
            看看怎么用
          </a>
          <p className={styles.downloadHint}>{downloadHint}</p>
        </motion.aside>
      </div>
    </section>
  )
}
