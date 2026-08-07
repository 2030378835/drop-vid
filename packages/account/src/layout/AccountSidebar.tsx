/**
 * @file 账户区侧边栏
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import { Icon } from '@dropvid/ui'
import type { MeResponse } from '../api/auth'
import { emailDisplayName } from '../utils/format'
import {
  ACCOUNT_NAV_GROUPS,
  accountPagePath,
  type AccountPageId
} from '../routes/paths'
import styles from './AccountLayout.module.css'

type Props = {
  me: MeResponse | null
  email: string
}

export function AccountSidebar({ me, email }: Props): JSX.Element {
  const planLabel = me?.plan === 'pro' ? 'Pro' : '免费版'
  const displayName = emailDisplayName(email)

  return (
    <aside className={styles.sidebar}>
      <Link className={styles.backLink} to="/">
        <Icon name="back" size={16} />
        <span>返回官网</span>
      </Link>

      <div className={styles.brandRow}>
        <img src={logo} alt="" width={22} height={22} />
        <span>DropVid</span>
      </div>

      <nav className={styles.sidebarNav} aria-label="账户导航">
        {ACCOUNT_NAV_GROUPS.map((group, index) => (
          <div key={group.title ?? `group-${index}`} className={styles.navGroup}>
            {group.title ? <p className={styles.navGroupTitle}>{group.title}</p> : null}
            <ul>
              {group.items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={accountPagePath(item.id as AccountPageId)}
                    className={({ isActive }) =>
                      [styles.navItem, isActive ? styles.navItemActive : '']
                        .filter(Boolean)
                        .join(' ')
                    }
                  >
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.sidebarProfile}>
        <div className={styles.profileAvatar} aria-hidden>
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className={styles.profileMeta}>
          <strong>{displayName}</strong>
          <span>{planLabel}</span>
        </div>
      </div>
    </aside>
  )
}
