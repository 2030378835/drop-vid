/**
 * @file 邮箱登录链接落地页
 * @description 链接确认登录 + 6 位备用码；内置浏览器检测与复制链接
 * @author qiangcan
 * @date 2026-08-08
 */

import { useCallback, useMemo, useState, type FormEvent, type JSX } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  completeClientLoginChallenge,
  verifyLoginCode,
  verifyLoginLinkOnce
} from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { consumeRememberMePref } from '../../auth/session'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { copyCurrentPageUrl, isInAppBrowser } from '../../utils/inAppBrowser'
import { AuthShell } from './AuthShell'
import styles from './LoginPage.module.css'

export function VerifyLoginPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() || ''
  const challengeId = searchParams.get('challenge')?.trim() || ''
  const emailFromQuery = searchParams.get('email')?.trim() || ''
  const { setSessionFromTokens } = useAuth()

  const inApp = useMemo(() => isInAppBrowser(), [])

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyHint, setCopyHint] = useState<string | null>(null)
  const [clientDone, setClientDone] = useState(false)
  const [done, setDone] = useState(false)

  const [codeEmail, setCodeEmail] = useState(emailFromQuery)
  const [loginCode, setLoginCode] = useState('')

  /** 登录成功后写会话并处理客户端 challenge */
  const finishLogin = useCallback(
    async (result: Awaited<ReturnType<typeof verifyLoginLinkOnce>>): Promise<void> => {
      await setSessionFromTokens(result, { remember: consumeRememberMePref() })

      if (challengeId) {
        if (result.challengeCompleted) {
          setClientDone(true)
        } else {
          await completeClientLoginChallenge(challengeId, result.accessToken, result.sessionId)
          setClientDone(true)
        }
        setDone(true)
        return
      }

      setDone(true)
      navigate(ACCOUNT_HOME_PATH, { replace: true })
    },
    [challengeId, navigate, setSessionFromTokens]
  )

  /** 邮件链接 token 确认登录 */
  const onConfirmLogin = useCallback(async (): Promise<void> => {
    if (!token || busy) return

    setBusy(true)
    setError(null)

    try {
      const result = await verifyLoginLinkOnce(token, challengeId || undefined)
      await finishLogin(result)
    } catch (e) {
      const message = e instanceof Error ? e.message : '登录失败'
      if (message.includes('无效') || message.includes('过期')) {
        setError('链接可能已失效。请使用邮件中的 6 位登录码，或重新发送登录邮件。')
      } else {
        setError(message)
      }
    } finally {
      setBusy(false)
    }
  }, [token, challengeId, busy, finishLogin])

  /** 6 位登录码备用登录 */
  const onSubmitCode = useCallback(
    async (event: FormEvent): Promise<void> => {
      event.preventDefault()
      if (busy) return

      const email = codeEmail.trim()
      const code = loginCode.trim()
      if (!email || code.length !== 6) {
        setError('请输入邮箱和 6 位登录码')
        return
      }

      setBusy(true)
      setError(null)

      try {
        const result = await verifyLoginCode(email, code, challengeId || undefined)
        await finishLogin(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : '登录码验证失败')
      } finally {
        setBusy(false)
      }
    },
    [busy, codeEmail, loginCode, challengeId, finishLogin]
  )

  const onCopyLink = useCallback(async (): Promise<void> => {
    const ok = await copyCurrentPageUrl()
    setCopyHint(ok ? '链接已复制，请粘贴到 Safari/Chrome 打开' : '复制失败，请手动复制地址栏链接')
  }, [])

  const invalidLink = !token

  return (
    <AuthShell>
      <div className={styles.stack}>
        <header className={styles.hero}>
          <h1 className={styles.title}>邮箱登录</h1>
          <p className={styles.subtitle}>
            {invalidLink
              ? '使用邮件中的登录码'
              : done
                ? '登录成功'
                : busy
                  ? '正在确认登录…'
                  : '请确认登录'}
          </p>
        </header>

        <div className={styles.body}>
          {inApp && !done ? (
            <div className={styles.clientPane}>
              <p className={styles.hint}>
                检测到 App 内置浏览器。登录态无法同步到 Safari/Chrome，建议复制链接到系统浏览器打开。
              </p>
              <button type="button" className={styles.primaryBtn} onClick={() => void onCopyLink()}>
                复制当前链接
              </button>
              {copyHint ? <p className={styles.hint}>{copyHint}</p> : null}
            </div>
          ) : null}

          {!invalidLink && !clientDone && !done ? (
            <>
              {error ? <p className={styles.error}>{error}</p> : null}
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={busy}
                onClick={() => void onConfirmLogin()}
              >
                {busy ? '登录中…' : '确认登录'}
              </button>
            </>
          ) : null}

          {!clientDone && !done ? (
            <form className={styles.form} onSubmit={(e) => void onSubmitCode(e)}>
              <p className={styles.hint}>链接打不开？输入邮件中的 6 位登录码：</p>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>邮箱</span>
                <input
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  value={codeEmail}
                  onChange={(e) => setCodeEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={busy}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>登录码</span>
                <input
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6 位数字"
                  disabled={busy}
                />
              </label>
              {invalidLink && error ? <p className={styles.error}>{error}</p> : null}
              <button type="submit" className={styles.primaryBtn} disabled={busy}>
                {busy ? '验证中…' : '使用登录码登录'}
              </button>
            </form>
          ) : null}

          {clientDone ? (
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
          ) : null}

          <p className={styles.secondaryLink}>
            <button type="button" disabled={busy} onClick={() => navigate('/login', { replace: true })}>
              返回登录
            </button>
          </p>
        </div>
      </div>
    </AuthShell>
  )
}
