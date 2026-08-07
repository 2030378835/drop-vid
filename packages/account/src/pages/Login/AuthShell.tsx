/**
 * @file 登录页布局壳
 * @description 独立登录页，Cursor 式居中暗色布局
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import '../../styles/tokens.css'
import styles from './AuthShell.module.css'

type Props = {
  children: ReactNode
  /** 页脚法律链接点击 */
  onOpenTerms?: () => void
  onOpenPrivacy?: () => void
}

/** 登录页独立外壳 */
export function AuthShell({ children, onOpenTerms, onOpenPrivacy }: Props): JSX.Element {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/">
          <img src={logo} alt="" width={22} height={22} />
          <span>DropVid</span>
        </Link>
        <Link className={styles.back} to="/">
          返回官网
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <button type="button" className={styles.footerLink} onClick={onOpenTerms}>
          服务条款
        </button>
        <span className={styles.footerSep}>·</span>
        <button type="button" className={styles.footerLink} onClick={onOpenPrivacy}>
          隐私政策
        </button>
      </footer>
    </div>
  )
}
