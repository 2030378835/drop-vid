/**
 * @file 账户区内容区
 * @description 标题 + 子页面 Outlet
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ACCOUNT_PAGE_IDS,
  ACCOUNT_PAGE_LABELS,
  accountPageIdFromPath,
  accountPagePath
} from '../routes/paths'
import styles from './AccountLayout.module.css'

export function AccountContent(): JSX.Element {
  const { pathname } = useLocation()
  const pageId = accountPageIdFromPath(pathname) ?? 'overview'
  const title = ACCOUNT_PAGE_LABELS[pageId]

  return (
    <div className={styles.main}>
      <nav className={styles.mobileTabs} aria-label="账户导航">
        {ACCOUNT_PAGE_IDS.map((id) => (
          <NavLink
            key={id}
            to={accountPagePath(id)}
            className={({ isActive }) =>
              [styles.mobileTab, isActive ? styles.mobileTabActive : ''].filter(Boolean).join(' ')
            }
          >
            {ACCOUNT_PAGE_LABELS[id]}
          </NavLink>
        ))}
      </nav>

      <header className={styles.mainHead}>
        <h1>{title}</h1>
      </header>

      <div className={styles.mainBody}>
        <Outlet />
      </div>
    </div>
  )
}
