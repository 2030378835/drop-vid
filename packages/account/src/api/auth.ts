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

export async function sendLoginLink(
  email: string,
  challengeId?: string
): Promise<{ isNewUser: boolean; message: string }> {
  const data = await accountFetch<{ ok: true; isNewUser: boolean; message: string }>(
    '/api/v1/auth/send-login-link',
    {
      method: 'POST',
      body: {
        email: email.trim(),
        ...(challengeId?.trim() ? { challengeId: challengeId.trim() } : {})
      }
    }
  )
  return { isNewUser: data.isNewUser === true, message: data.message }
}

/** 邮箱登录链接换会话 */
export async function verifyLoginLink(
  token: string,
  challengeId?: string
): Promise<AuthTokens & { challengeCompleted?: boolean }> {
  const data = await accountFetch<{ ok: true } & AuthTokens & { challengeCompleted?: boolean }>(
    '/api/v1/auth/verify-login',
    {
      method: 'POST',
      body: {
        token: token.trim(),
        ...(challengeId?.trim() ? { challengeId: challengeId.trim() } : {})
      }
    }
  )
  return {
    ...parseAuthTokens(data),
    challengeCompleted: data.challengeCompleted
  }
}

const verifyLoginLinkCache = new Map<
  string,
  Promise<AuthTokens & { challengeCompleted?: boolean }>
>()

export function verifyLoginLinkOnce(
  token: string,
  challengeId?: string
): Promise<AuthTokens & { challengeCompleted?: boolean }> {
  const trimmed = token.trim()
  const key = `${trimmed}:${challengeId?.trim() || ''}`
  const cached = verifyLoginLinkCache.get(key)
  if (cached) return cached

  const promise = verifyLoginLink(trimmed, challengeId?.trim() || undefined).catch((err) => {
    verifyLoginLinkCache.delete(key)
    throw err
  })
  verifyLoginLinkCache.set(key, promise)
  return promise
}

/** @deprecated 管理端等仍可使用；官网已改为邮件链接登录 */
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
  return parseAuthTokens(data)
}

/** 密码注册：发送验证邮件 */
export async function registerWithPassword(options: {
  email: string
  password: string
  confirmPassword: string
  challengeId?: string
}): Promise<{ message: string }> {
  const data = await accountFetch<{ ok: true; message: string }>('/api/v1/auth/register-password', {
    method: 'POST',
    body: {
      email: options.email.trim(),
      password: options.password,
      confirmPassword: options.confirmPassword,
      ...(options.challengeId?.trim() ? { challengeId: options.challengeId.trim() } : {})
    }
  })
  return { message: data.message }
}

/** 密码登录 */
export async function loginWithPassword(email: string, password: string): Promise<AuthTokens> {
  const data = await accountFetch<{ ok: true } & AuthTokens>('/api/v1/auth/login-password', {
    method: 'POST',
    body: { email: email.trim(), password }
  })
  return parseAuthTokens(data)
}

/** 邮箱验证链接换会话 */
export async function verifyEmailToken(
  token: string,
  challengeId?: string
): Promise<AuthTokens & { challengeCompleted?: boolean }> {
  const data = await accountFetch<{ ok: true } & AuthTokens & { challengeCompleted?: boolean }>(
    '/api/v1/auth/verify-email',
    {
      method: 'POST',
      body: {
        token: token.trim(),
        ...(challengeId?.trim() ? { challengeId: challengeId.trim() } : {})
      }
    }
  )
  return {
    ...parseAuthTokens(data),
    challengeCompleted: data.challengeCompleted
  }
}

/** 同一 token 只发起一次验证请求（StrictMode 双挂载会重复触发 useEffect） */
const verifyEmailCache = new Map<
  string,
  Promise<AuthTokens & { challengeCompleted?: boolean }>
>()

export function verifyEmailTokenOnce(
  token: string,
  challengeId?: string
): Promise<AuthTokens & { challengeCompleted?: boolean }> {
  const trimmed = token.trim()
  const key = `${trimmed}:${challengeId?.trim() || ''}`
  const cached = verifyEmailCache.get(key)
  if (cached) return cached

  const promise = verifyEmailToken(trimmed, challengeId?.trim() || undefined).catch((err) => {
    // 失败时清缓存，便于用户重试；成功结果保留，避免 StrictMode 二次挂载重复请求
    verifyEmailCache.delete(key)
    throw err
  })
  verifyEmailCache.set(key, promise)
  return promise
}

/** 重发邮箱验证邮件 */
export async function resendVerificationEmail(
  email: string,
  challengeId?: string
): Promise<{ message: string }> {
  const data = await accountFetch<{ ok: true; message: string }>('/api/v1/auth/resend-verification', {
    method: 'POST',
    body: {
      email: email.trim(),
      ...(challengeId?.trim() ? { challengeId: challengeId.trim() } : {})
    }
  })
  return { message: data.message }
}

function parseAuthTokens(data: { ok: true } & AuthTokens): AuthTokens {
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
