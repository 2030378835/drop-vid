/**
 * @file 邮箱登录链接落地页
 * @description 点击邮件链接完成登录或自动注册
 * @author qiangcan
 * @date 2026-08-08
 */

import { useEffect, useState, type JSX } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { completeClientLoginChallenge, verifyLoginLinkOnce } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { consumeRememberMePref } from '../../auth/session'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { AuthShell } from './AuthShell'
import styles from './LoginPage.module.css'

export function VerifyLoginPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() || ''
  const challengeId = searchParams.get('challenge')?.trim() || ''
  const { setSessionFromTokens } = useAuth()

  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientDone, setClientDone] = useState(false)

  useEffect(() => {
    if (!token) {
      setBusy(false)
      setError('登录链接无效，请重新发送邮件')
      return
    }

    let cancelled = false
    void verifyLoginLinkOnce(token, challengeId || undefined)
      .then(async (result) => {
        if (cancelled) return
        await setSessionFromTokens(result, { remember: consumeRememberMePref() })
        if (challengeId) {
          if (result.challengeCompleted) {
            setClientDone(true)
          } else {
            await completeClientLoginChallenge(
              challengeId,
              result.accessToken,
              result.sessionId
            )
            setClientDone(true)
          }
          return
        }
        navigate(ACCOUNT_HOME_PATH, { replace: true })
      })
      .catch((e) => {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : '登录失败'
          if (message.includes('无效') || message.includes('过期')) {
            setError('该链接可能已被使用。若您已完成登录，请返回登录页。')
          } else {
            setError(message)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, challengeId, navigate, setSessionFromTokens])

  return (
    <AuthShell>
      <div className={styles.stack}>
        <header className={styles.hero}>
          <h1 className={styles.title}>邮箱登录</h1>
          <p className={styles.subtitle}>
            {busy ? '正在确认登录…' : error ? '登录未完成' : '登录成功'}
          </p>
        </header>

        <div className={styles.body}>
          {busy ? (
            <p className={styles.hint}>请稍候</p>
          ) : error ? (
            <>
              <p className={styles.error}>{error}</p>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => navigate('/login', { replace: true })}
              >
                返回登录
              </button>
            </>
          ) : clientDone ? (
            <div className={styles.clientPane}>
              <p className={styles.success}>已登录并授权桌面客户端，请返回 DropVid 应用。</p>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => navigate(ACCOUNT_HOME_PATH)}
              >
                进入账户中心
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => navigate(ACCOUNT_HOME_PATH, { replace: true })}
            >
              进入账户中心
            </button>
          )}
        </div>
      </div>
    </AuthShell>
  )
}
