/**
 * @file 认证 API
 * @author qiangcan
 * @date 2026-08-07
 */

import { DEVELOPMENT_API_BASE_URL, PRODUCTION_API_BASE_URL } from '@dropvid/shared'
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

/**
 * GitHub OAuth 入口（整页跳转，直连 API，避免 Vite 代理吞 302）。
 * 开发默认 localhost:3000；可用 VITE_API_BASE_URL 覆盖。
 */
export function getGitHubOAuthStartUrl(challengeId?: string): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  const base = (
    fromEnv ||
    (import.meta.env.DEV ? DEVELOPMENT_API_BASE_URL : PRODUCTION_API_BASE_URL)
  ).replace(/\/$/, '')
  const url = new URL(`${base}/api/v1/auth/oauth/github`)
  if (challengeId?.trim()) {
    url.searchParams.set('challenge', challengeId.trim())
  }
  return url.toString()
}

/** 用一次性 ticket 换取会话 tokens */
export async function exchangeOAuthTicket(ticket: string): Promise<AuthTokens & { challengeId?: string }> {
  const data = await accountFetch<{ ok: true } & AuthTokens & { challengeId?: string }>(
    '/api/v1/auth/oauth/ticket',
    {
      method: 'POST',
      body: { ticket: ticket.trim() }
    }
  )
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    sessionId: data.sessionId,
    user: data.user,
    isNewUser: data.isNewUser,
    challengeId: data.challengeId
  }
}

/** 预览客户端登录挑战 */
export async function peekClientLoginChallenge(challengeId: string): Promise<{
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'consumed'
  expiresIn: number
  clientDeviceLabel: string
}> {
  return accountFetch(
    `/api/v1/auth/client-login-challenge/${encodeURIComponent(challengeId)}?peek=1`
  )
}

/** 官网确认：为桌面客户端签发登录 */
export async function completeClientLoginChallenge(
  challengeId: string,
  accessToken: string,
  sessionId?: string
): Promise<{ ok: true; userEmail: string }> {
  return accountFetch(`/api/v1/auth/client-login-challenge/${encodeURIComponent(challengeId)}/complete`, {
    method: 'POST',
    token: accessToken,
    sessionId
  })
}
