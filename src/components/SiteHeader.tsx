import type { JSX } from 'react'
import logo from '../assets/logo.png'
import styles from './SiteHeader.module.css'

type Props = {
  variant?: 'default' | 'onHero'
}

export function SiteHeader({ variant = 'default' }: Props): JSX.Element {
  return (
    <header className={`${styles.header} ${variant === 'onHero' ? styles.onHero : ''}`}>
      <a className={styles.brand} href="#top" aria-label="DropVid 首页">
        <img src={logo} alt="" width={28} height={28} className={styles.mark} />
        <span>DropVid</span>
      </a>
      <nav className={styles.nav} aria-label="页面导航">
        <a href="#how">用法</a>
        <a href="#platforms">平台</a>
        <a href="#features">能力</a>
        <a className={styles.cta} href="#download">
          下载
        </a>
      </nav>
    </header>
  )
}
