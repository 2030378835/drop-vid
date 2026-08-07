/**
 * @file 应用主框架
 * @description 组装官网与用户中心路由
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  AccountLayout,
  AuthProvider,
  CloudHistoryPage,
  DevicesPage,
  LoginPage,
  OAuthCallbackPage,
  OverviewPage,
  SettingsPage,
  UsagePage
} from '@dropvid/account'
import { Home, PricingPage, ScrollToHash } from '@dropvid/site'
import { routerBasename } from './config/router'

export default function App(): JSX.Element {
  return (
    <BrowserRouter basename={routerBasename()}>
      <AuthProvider>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/oauth/callback" element={<OAuthCallbackPage />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
