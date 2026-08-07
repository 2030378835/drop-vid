/**
 * @file 账户区公共布局
 * @description 侧边栏 + 内容区；未登录跳转登录页
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'
import '../styles/tokens.css'
import { useAuth } from '../auth/AuthProvider'
import { PlatformCatalogProvider } from '../platform/PlatformCatalogProvider'
import { AccountSidebar } from './AccountSidebar'
import { AccountContent } from './AccountContent'
import styles from './AccountLayout.module.css'

export function AccountLayout(): JSX.Element {
  const { session, me, loading } = useAuth()

  if (!loading && !session) {
    return <Navigate to="/login" replace />
  }

  const email = me?.user.email || session?.user.email || '—'

  return (
    <PlatformCatalogProvider>
      <div className={styles.shell}>
        <AccountSidebar me={me} email={email} />
        <AccountContent />
      </div>
    </PlatformCatalogProvider>
  )
}
