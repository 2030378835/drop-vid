/**
 * @file 官网登录会话持久化
 * @description localStorage（记住我）或 sessionStorage（关闭标签页即失效）
 * @author qiangcan
 * @date 2026-08-08
 */

import type { AuthTokens, AuthUser } from '../api/auth'

const STORAGE_KEY = 'dropvid:web-auth'
const REMEMBER_PREF_KEY = 'dropvid:remember-me'
const PENDING_REMEMBER_KEY = 'dropvid:pending-remember-me'

export type StoredWebSession = {
  accessToken: string
  refreshToken: string
  sessionId: string
  accessExpiresAt: number
  user: AuthUser
}

function parseStoredSession(raw: string | null): StoredWebSession | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredWebSession
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.user?.id) return null
    return parsed
  } catch {
    return null
  }
}

/** 读取「记住我」偏好，默认开启 */
export function loadRememberMePref(): boolean {
  return localStorage.getItem(REMEMBER_PREF_KEY) !== '0'
}

/** 发送登录邮件前暂存「记住我」选择，供邮件链接落地页消费 */
export function stashRememberMePref(remember: boolean): void {
  localStorage.setItem(PENDING_REMEMBER_KEY, remember ? '1' : '0')
}

/** 读取并清除暂存的「记住我」；无暂存时沿用当前偏好 */
export function consumeRememberMePref(): boolean {
  const pending = localStorage.getItem(PENDING_REMEMBER_KEY)
  localStorage.removeItem(PENDING_REMEMBER_KEY)
  if (pending === '1') return true
  if (pending === '0') return false
  return loadRememberMePref()
}

export function loadWebSession(): StoredWebSession | null {
  return (
    parseStoredSession(localStorage.getItem(STORAGE_KEY)) ??
    parseStoredSession(sessionStorage.getItem(STORAGE_KEY))
  )
}

export function saveWebSession(tokens: AuthTokens, remember = true): StoredWebSession {
  const session: StoredWebSession = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    sessionId: tokens.sessionId,
    accessExpiresAt: Date.now() + tokens.expiresIn * 1000,
    user: tokens.user
  }

  localStorage.setItem(REMEMBER_PREF_KEY, remember ? '1' : '0')
  clearWebSession()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session
}

export function clearWebSession(): void {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}
