/**
 * @file 官网登录会话持久化
 * @description localStorage 保存 access/refresh；无 HttpOnly Cookie
 * @author qiangcan
 * @date 2026-08-07
 */

import type { AuthTokens, AuthUser } from '../api/auth'

const STORAGE_KEY = 'dropvid:web-auth'

export type StoredWebSession = {
  accessToken: string
  refreshToken: string
  sessionId: string
  accessExpiresAt: number
  user: AuthUser
}

export function loadWebSession(): StoredWebSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredWebSession
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.user?.id) return null
    return parsed
  } catch {
    return null
  }
}

export function saveWebSession(tokens: AuthTokens): StoredWebSession {
  const session: StoredWebSession = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    sessionId: tokens.sessionId,
    accessExpiresAt: Date.now() + tokens.expiresIn * 1000,
    user: tokens.user
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session
}

export function clearWebSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}
