import type { JSX } from 'react'
import styles from './SiteFooter.module.css'

export function SiteFooter(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <strong className={styles.brand}>DropVid</strong>
          <p>丢入链接，即刻拥有视频</p>
        </div>
        <p className={styles.legal}>
          DropVid 仅提供技术工具，请合法合规下载内容。相关权利与责任由使用者自行承担。请勿用于侵权或违法用途。
        </p>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} DropVid</p>
    </footer>
  )
}
