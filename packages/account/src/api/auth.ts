/**
 * @file 认证 API
 * @author qiangcan
 * @date 2026-08-07
 */

import { accountFetch } from './client'

export type AuthUser = {
  id: string
  email: string
  createdAt: number
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  sessionId: string
  user: AuthUser
  isNewUser?: boolean
}

export type MeResponse = {
  user: AuthUser
  plan: 'free' | 'pro'
  quota: { limit: number; used: number; remaining: number }
  cloudHistory: { limit: number; used: number; remaining: number }
  sessions: Array<{
    id: string
    deviceLabel?: string
    locationLabel?: string
    lastSeenAt?: number
    createdAt: number
    isCurrent?: boolean
  }>
}

export async function sendLoginCode(email: string): Promise<{ isNewUser: boolean }> {
  const data = await accountFetch<{ ok: true; isNewUser: boolean }>('/api/v1/auth/send-code', {
    method: 'POST',
    body: { email: email.trim() }
  })
  return { isNewUser: data.isNewUser === true }
}

export async function verifyLoginCode(email: string, code: string): Promise<AuthTokens> {
  const data = await accountFetch<{ ok: true } & AuthTokens>('/api/v1/auth/verify-code', {
    method: 'POST',
    body: { email: email.trim(), code: code.trim() }
  })
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    sessionId: data.sessionId,
    user: data.user,
    isNewUser: data.isNewUser
  }
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthTokens> {
  const data = await accountFetch<{ ok: true } & AuthTokens>('/api/v1/auth/refresh', {
    method: 'POST',
    body: { refreshToken }
  })
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    sessionId: data.sessionId,
    user: data.user
  }
}

export async function logoutAuthSession(refreshToken: string): Promise<void> {
  try {
    await accountFetch('/api/v1/auth/logout', {
      method: 'POST',
      body: { refreshToken }
    })
  } catch {
    // 本地仍清除
  }
}

export async function fetchMe(accessToken: string, sessionId?: string): Promise<MeResponse> {
  const data = await accountFetch<{ ok: true } & MeResponse>('/api/v1/me', {
    token: accessToken,
    sessionId
  })
  return {
    user: data.user,
    plan: data.plan,
    quota: data.quota,
    cloudHistory: data.cloudHistory,
    sessions: data.sessions
  }
}

export async function createLoginChallenge(): Promise<{
  challengeId: string
  deepLink: string
  expiresIn: number
  pollIntervalMs: number
}> {
  return accountFetch('/api/v1/auth/login-challenge', { method: 'POST' })
}

export async function pollLoginChallenge(challengeId: string): Promise<{
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'consumed'
  tokens?: AuthTokens
  expiresIn: number
}> {
  return accountFetch(`/api/v1/auth/login-challenge/${encodeURIComponent(challengeId)}`)
}
