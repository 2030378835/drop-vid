/**
 * @file 账户子应用路由
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AccountLayout } from '../layout/AccountLayout'
import {
  CloudHistoryPage,
  DevicesPage,
  LoginPage,
  OverviewPage,
  RegisterPage,
  SettingsPage,
  UsagePage,
  VerifyEmailPage,
  VerifyLoginPage
} from '../pages'
import { ACCOUNT_HOME_PATH } from '../routes/paths'

/** 登录 + 账户区嵌套路由 */
export function AccountRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ACCOUNT_HOME_PATH} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-login" element={<VerifyLoginPage />} />
      <Route path="/account" element={<AccountLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="usage" element={<UsagePage />} />
        <Route path="history" element={<CloudHistoryPage />} />
        <Route path="analytics" element={<Navigate to="/account/overview" replace />} />
        <Route path="export" element={<Navigate to="/account/history" replace />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

/** 供官网 App 嵌入的 Route 片段 */
export function AccountRouteTree(): JSX.Element {
  return (
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-login" element={<VerifyLoginPage />} />
      <Route path="/account" element={<AccountLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="usage" element={<UsagePage />} />
        <Route path="history" element={<CloudHistoryPage />} />
        <Route path="analytics" element={<Navigate to="overview" replace />} />
        <Route path="export" element={<Navigate to="history" replace />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </>
  )
}
