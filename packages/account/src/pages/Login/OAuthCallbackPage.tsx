/**
 * @file OAuth 回调落地页
 * @description 用服务端一次性 ticket 落会话；支持客户端 challenge 授权
 * @author qiangcan
 * @date 2026-08-08
 */

import { useEffect, useRef, useState, type JSX } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  completeClientLoginChallenge,
  exchangeOAuthTicket
} from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { AuthShell } from './AuthShell'
import styles from './LoginPage.module.css'

export function OAuthCallbackPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSessionFromTokens } = useAuth()
  const ranRef = useRef(false)

  const ticket = searchParams.get('ticket')?.trim() || ''
  const challengeId = searchParams.get('challenge')?.trim() || ''

  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [clientDone, setClientDone] = useState(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    if (!ticket) {
      setError('登录凭证缺失，请重新使用 GitHub 登录')
      return
    }

    void (async () => {
      try {
        const tokens = await exchangeOAuthTicket(ticket)
        await setSessionFromTokens(tokens)
        const nextChallenge = challengeId || tokens.challengeId || ''
        if (nextChallenge) {
          await completeClientLoginChallenge(
            nextChallenge,
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
  }, [ticket, challengeId, navigate, setSessionFromTokens])

  const loginHref = challengeId
    ? `/login?challenge=${encodeURIComponent(challengeId)}`
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
              <p className={styles.hint}>正在与 GitHub 完成会话交换…</p>
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
