/**
 * @file 官网认证上下文
 * @description 会话恢复、刷新、登出；refresh 单飞避免误清登录态
 * @author qiangcan
 * @date 2026-08-07
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode
} from 'react'
import {
  fetchMe,
  logoutAuthSession,
  refreshAuthSession,
  type AuthTokens,
  type MeResponse
} from '../api/auth'
import {
  clearWebSession,
  loadWebSession,
  saveWebSession,
  type StoredWebSession
} from './session'

type AuthContextValue = {
  session: StoredWebSession | null
  me: MeResponse | null
  loading: boolean
  setSessionFromTokens: (tokens: AuthTokens) => Promise<void>
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Refresh 单飞：服务端轮换 refresh token 后旧 token 立即作废，
 * 并发 refresh（StrictMode / 多处挂载）会导致后者 401 并误清登录态。
 */
let refreshInFlight: Promise<StoredWebSession | null> | null = null

async function refreshWebSessionSingleFlight(
  refreshToken: string
): Promise<StoredWebSession | null> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      // 若其它标签页已轮换成功，优先用最新本地 token
      const latest = loadWebSession()
      const token = latest?.refreshToken || refreshToken
      const tokens = await refreshAuthSession(token)
      return saveWebSession(tokens)
    } catch {
      // 并发失败者：若本地已有更新后的会话，视为成功
      const recovered = loadWebSession()
      if (recovered && recovered.refreshToken !== refreshToken) {
        return recovered
      }
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<StoredWebSession | null>(() => loadWebSession())
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (): Promise<void> => {
    let current = loadWebSession()
    if (!current) {
      setSession(null)
      setMe(null)
      return
    }

    // access 临近过期则先刷新
    if (current.accessExpiresAt < Date.now() + 60_000) {
      const refreshed = await refreshWebSessionSingleFlight(current.refreshToken)
      if (!refreshed) {
        clearWebSession()
        setSession(null)
        setMe(null)
        return
      }
      current = refreshed
      setSession(current)
    }

    try {
      const profile = await fetchMe(current.accessToken, current.sessionId)
      setMe(profile)
      setSession((prev) =>
        prev
          ? {
              ...prev,
              user: profile.user
            }
          : prev
      )
    } catch {
      // 再试一次 refresh（含被挤下线后的明确失败）
      const refreshed = await refreshWebSessionSingleFlight(current.refreshToken)
      if (!refreshed) {
        clearWebSession()
        setSession(null)
        setMe(null)
        return
      }
      try {
        current = refreshed
        setSession(current)
        const profile = await fetchMe(current.accessToken, current.sessionId)
        setMe(profile)
      } catch {
        clearWebSession()
        setSession(null)
        setMe(null)
      }
    }
  }, [])

  useEffect(() => {
    void (async () => {
      await refreshProfile()
      setLoading(false)
    })()
  }, [refreshProfile])

  const setSessionFromTokens = useCallback(async (tokens: AuthTokens): Promise<void> => {
    const saved = saveWebSession(tokens)
    setSession(saved)
    const profile = await fetchMe(saved.accessToken, saved.sessionId)
    setMe(profile)
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    const current = loadWebSession()
    if (current) await logoutAuthSession(current.refreshToken)
    clearWebSession()
    setSession(null)
    setMe(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      me,
      loading,
      setSessionFromTokens,
      refreshProfile,
      logout
    }),
    [session, me, loading, setSessionFromTokens, refreshProfile, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
