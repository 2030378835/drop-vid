/**
 * @file 账户子应用入口
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX, ReactNode } from 'react'
import { AuthProvider } from '../auth/AuthProvider'
import { AccountRoutes } from './AccountRoutes'

type Props = {
  children?: ReactNode
}

export function AccountApp({ children }: Props): JSX.Element {
  return <AuthProvider>{children ?? <AccountRoutes />}</AuthProvider>
}

export { AccountRoutes, AccountRouteTree } from './AccountRoutes'
export { AuthProvider, useAuth } from '../auth/AuthProvider'
export { AccountLayout } from '../layout/AccountLayout'
export {
  LoginPage,
  OAuthCallbackPage,
  OverviewPage,
  UsagePage,
  CloudHistoryPage,
  DevicesPage,
  SettingsPage
} from '../pages'
export { ACCOUNT_HOME_PATH, accountPagePath } from '../routes/paths'
export type { AuthTokens, AuthUser, MeResponse } from '../api/auth'
export type { CloudUserStats } from '../api/stats'
