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
}

/** 登录页独立外壳 */
export function AuthShell({ children }: Props): JSX.Element {
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
        <Link to="/legal#terms" className={styles.footerLink}>
          服务条款
        </Link>
        <span className={styles.footerSep}>·</span>
        <Link to="/legal#privacy" className={styles.footerLink}>
          隐私政策
        </Link>
      </footer>
    </div>
  )
}
