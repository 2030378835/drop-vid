/**
 * @file OAuth 回调落地页
 * @description 从 URL hash 落会话（兼容 GitHub Pages HTTPS + HTTP API）；支持客户端 challenge
 * @author qiangcan
 * @date 2026-08-08
 */

import { useEffect, useRef, useState, type JSX } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  completeClientLoginChallenge,
  exchangeOAuthTicket,
  type AuthTokens
} from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { AuthShell } from './AuthShell'
import styles from './LoginPage.module.css'

type OAuthHashPayload = AuthTokens & {
  challengeId?: string
  challengeCompleted?: boolean
}

/** 解析服务端写入的 #payload=base64url(json) */
function readHashPayload(): OAuthHashPayload | null {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw) return null
  const params = new URLSearchParams(raw)
  const encoded = params.get('payload')?.trim()
  if (!encoded) return null
  try {
    const padded = encoded + '='.repeat((4 - (encoded.length % 4)) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    const parsed = JSON.parse(json) as OAuthHashPayload
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.user?.id) return null
    return parsed
  } catch {
    return null
  }
}

function clearHash(): void {
  const url = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, '', url)
}

export function OAuthCallbackPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSessionFromTokens } = useAuth()
  const ranRef = useRef(false)

  const ticket = searchParams.get('ticket')?.trim() || ''
  const challengeFromQuery = searchParams.get('challenge')?.trim() || ''

  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [clientDone, setClientDone] = useState(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    void (async () => {
      try {
        const fromHash = readHashPayload()
        clearHash()

        let tokens: AuthTokens
        let challengeId = challengeFromQuery
        let challengeCompleted = false

        if (fromHash) {
          tokens = {
            accessToken: fromHash.accessToken,
            refreshToken: fromHash.refreshToken,
            expiresIn: fromHash.expiresIn,
            sessionId: fromHash.sessionId,
            user: fromHash.user,
            isNewUser: fromHash.isNewUser
          }
          challengeId = fromHash.challengeId || challengeId
          challengeCompleted = fromHash.challengeCompleted === true
        } else if (ticket) {
          // 兼容旧 ticket 换票（本地 HTTP 官网可用；HTTPS Pages 会被混合内容拦截）
          const exchanged = await exchangeOAuthTicket(ticket)
          tokens = exchanged
          challengeId = challengeId || exchanged.challengeId || ''
        } else {
          setError('登录凭证缺失，请重新使用 GitHub 登录')
          return
        }

        await setSessionFromTokens(tokens)

        if (challengeId && challengeCompleted) {
          setClientDone(true)
          setHint('已授权桌面客户端登录，请返回 DropVid 应用。')
          return
        }

        if (challengeId) {
          await completeClientLoginChallenge(
            challengeId,
            tokens.accessToken,
            tokens.sessionId
          )
          setClientDone(true)
          setHint('已授权桌面客户端登录，请返回 DropVid 应用。')
          return
        }

        navigate(ACCOUNT_HOME_PATH, { replace: true })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'GitHub 登录失败')
      }
    })()
  }, [ticket, challengeFromQuery, navigate, setSessionFromTokens])

  const loginHref = challengeFromQuery
    ? `/login?challenge=${encodeURIComponent(challengeFromQuery)}`
    : '/login'

  return (
    <AuthShell>
      <div className={styles.stack}>
        <header className={styles.hero}>
          <h1 className={styles.title}>正在完成登录</h1>
          <p className={styles.subtitle}>
            {error ? '登录未能完成' : clientDone ? '授权成功' : '请稍候…'}
          </p>
        </header>
        <div className={styles.body}>
          <div className={styles.clientPane}>
            {error ? <p className={styles.error}>{error}</p> : null}
            {hint ? <p className={styles.success}>{hint}</p> : null}
            {!error && !clientDone ? (
              <p className={styles.hint}>正在完成登录…</p>
            ) : null}
            {error ? (
              <Link className={styles.primaryBtn} to={loginHref}>
                返回登录
              </Link>
            ) : null}
            {clientDone ? (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => navigate(ACCOUNT_HOME_PATH)}
              >
                进入账户中心
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </AuthShell>
  )
}
