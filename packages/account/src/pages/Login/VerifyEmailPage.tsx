/**
 * @file 邮箱验证落地页
 * @description 密码注册邮件链接验证并完成登录
 * @author qiangcan
 * @date 2026-08-08
 */

import { useEffect, useState, type JSX } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { completeClientLoginChallenge, verifyEmailTokenOnce } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { AuthShell } from './AuthShell'
import styles from './LoginPage.module.css'

export function VerifyEmailPage(): JSX.Element {
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
      setError('验证链接无效，请重新注册')
      return
    }

    let cancelled = false
    void verifyEmailTokenOnce(token, challengeId || undefined)
      .then(async (result) => {
        if (cancelled) return
        await setSessionFromTokens(result)
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
          const message = e instanceof Error ? e.message : '验证失败'
          if (message.includes('无效') || message.includes('过期')) {
            setError('该链接可能已被使用。若您已完成验证，请直接登录。')
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
          <h1 className={styles.title}>邮箱验证</h1>
          <p className={styles.subtitle}>
            {busy ? '正在验证邮箱并登录…' : error ? '验证未完成' : '验证成功'}
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
              <p className={styles.success}>已验证并授权桌面客户端，请返回 DropVid 应用。</p>
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
