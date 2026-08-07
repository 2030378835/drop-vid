/**
 * @file 登录页布局壳
 * @description 账户子应用独立布局，不依赖官网 SiteHeader
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import styles from './AuthShell.module.css'

type Props = {
  children: ReactNode
}

export function AuthShell({ children }: Props): JSX.Element {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/">
          <img src={logo} alt="" width={24} height={24} />
          <span>DropVid</span>
        </Link>
        <Link className={styles.back} to="/">
          返回官网
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span>© DropVid</span>
      </footer>
    </div>
  )
}
