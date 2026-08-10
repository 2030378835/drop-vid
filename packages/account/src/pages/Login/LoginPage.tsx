/**
 * @file 官网登录页
 * @description 默认密码登录；邮箱链接 Tab 可选；支持 ?challenge= 桌面客户端授权
 * @author qiangcan
 * @date 2026-08-08
 */

import { useEffect, useState, type FormEvent, type JSX } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@dropvid/ui'
import {
  completeClientLoginChallenge,
  loginWithPassword,
  peekClientLoginChallenge,
  resendVerificationEmail,
  sendLoginLink
} from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { loadRememberMePref, stashRememberMePref } from '../../auth/session'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { AuthShell } from './AuthShell'
import styles from './LoginPage.module.css'

type LoginMethod = 'email' | 'password'

/** 带 query 的注册页路径（保留 challenge 等参数） */
function registerPathFromSearch(searchParams: URLSearchParams): string {
  const qs = searchParams.toString()
  return qs ? `/register?${qs}` : '/register'
}

export function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const challengeId = searchParams.get('challenge')?.trim() || ''

  const { session, loading, setSessionFromTokens } = useAuth()

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => loadRememberMePref())

  const [loginMailSent, setLoginMailSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const [clientLabel, setClientLabel] = useState<string | null>(null)
  const [clientDone, setClientDone] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    if (!challengeId) return
    let cancelled = false
    void peekClientLoginChallenge(challengeId)
      .then((peeked) => {
        if (!cancelled) setClientLabel(peeked.clientDeviceLabel)
      })
      .catch(() => {
        if (!cancelled) setError('登录请求已失效，请在客户端重新发起')
      })
    return () => {
      cancelled = true
    }
  }, [challengeId])

  if (!loading && session && !challengeId) {
    return <Navigate to={ACCOUNT_HOME_PATH} replace />
  }

  const resetMessages = (): void => {
    setError(null)
    setHint(null)
  }

  const completeForClient = async (accessToken: string, sessionId?: string): Promise<void> => {
    if (!challengeId) return
    await completeClientLoginChallenge(challengeId, accessToken, sessionId)
    setClientDone(true)
    setHint('已授权桌面客户端登录，请返回 DropVid 应用。')
  }

  const onOneClickClientLogin = async (): Promise<void> => {
    if (!session?.accessToken || !challengeId) return
    resetMessages()
    setBusy(true)
    try {
      await completeForClient(session.accessToken, session.sessionId)
    } catch (e) {
      setError(e instanceof Error ? e.message : '授权失败')
    } finally {
      setBusy(false)
    }
  }

  const onSendLoginLink = async (event?: FormEvent): Promise<void> => {
    event?.preventDefault()
    resetMessages()
    if (!email.trim()) {
      setError('请输入邮箱')
      return
    }
    if (loginMailSent && cooldown <= 0) {
      await resendLoginLink()
      return
    }
    if (cooldown > 0) return

    stashRememberMePref(rememberMe)
    setBusy(true)
    try {
      const result = await sendLoginLink(email, challengeId || undefined)
      setLoginMailSent(true)
      setCooldown(60)
      setHint(
        result.message ||
          (result.isNewUser
            ? '登录邮件已发送，点击链接后将自动完成注册并登录。'
            : '登录邮件已发送，请查收邮箱并点击链接完成登录。')
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败')
    } finally {
      setBusy(false)
    }
  }

  const resendLoginLink = async (): Promise<void> => {
    stashRememberMePref(rememberMe)
    setBusy(true)
    try {
      const result = await sendLoginLink(email, challengeId || undefined)
      setLoginMailSent(true)
      setCooldown(60)
      setHint(result.message || '登录邮件已重新发送，请在 5 分钟内点击链接。')
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败')
    } finally {
      setBusy(false)
    }
  }

  const onPasswordLogin = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    resetMessages()
    if (!email.trim()) {
      setError('请输入邮箱')
      return
    }
    if (!password) {
      setError('请输入密码')
      return
    }
    setBusy(true)
    try {
      const tokens = await loginWithPassword(email, password)
      await setSessionFromTokens(tokens, { remember: rememberMe })
      if (challengeId) {
        await completeForClient(tokens.accessToken, tokens.sessionId)
        return
      }
      navigate(ACCOUNT_HOME_PATH, { replace: true })
    } catch (e) {
      const message = e instanceof Error ? e.message : '登录失败'
      setError(message)
      if (message.includes('尚未验证')) {
        setHint('可点击下方重发验证邮件')
      }
    } finally {
      setBusy(false)
    }
  }

  const onResendVerification = async (): Promise<void> => {
    resetMessages()
    if (!email.trim()) {
      setError('请输入邮箱')
      return
    }
    setBusy(true)
    try {
      const result = await resendVerificationEmail(email, challengeId || undefined)
      setHint(result.message || '验证邮件已重新发送，请在 5 分钟内完成验证。')
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败')
    } finally {
      setBusy(false)
    }
  }

  const title = challengeId ? '登录到 DropVid 客户端' : '登录 DropVid'
  const subtitle = challengeId
    ? clientLabel
      ? `${clientLabel} 请求使用你的账户登录`
      : '请在浏览器中完成验证以授权桌面客户端'
    : '同步云端记录，随时随地使用'

  return (
    <AuthShell>
      <div className={styles.stack}>
        <header className={styles.hero}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        <div className={styles.body}>
          {challengeId && session && !clientDone ? (
            <div className={styles.clientPane}>
              {error ? <p className={styles.error}>{error}</p> : null}
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={busy}
                onClick={() => void onOneClickClientLogin()}
              >
                {busy ? '授权中…' : '一键登录客户端'}
              </button>
            </div>
          ) : clientDone ? (
            <div className={styles.clientPane}>
              <p className={styles.success}>{hint}</p>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => navigate(ACCOUNT_HOME_PATH)}
              >
                进入账户中心
              </button>
            </div>
          ) : (
            <>
              <div className={styles.methodRow} role="tablist" aria-label="登录方式">
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginMethod === 'password'}
                  className={`${styles.methodBtn} ${loginMethod === 'password' ? styles.methodBtnActive : ''}`}
                  onClick={() => {
                    setLoginMethod('password')
                    resetMessages()
                  }}
                >
                  <span className={styles.methodIcon}>
                    <Icon name="lock" size={20} aria-hidden />
                  </span>
                  密码
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginMethod === 'email'}
                  className={`${styles.methodBtn} ${loginMethod === 'email' ? styles.methodBtnActive : ''}`}
                  onClick={() => {
                    setLoginMethod('email')
                    resetMessages()
                    setLoginMailSent(false)
                    setCooldown(0)
                  }}
                >
                  <span className={styles.methodIcon}>
                    <Icon name="mail" size={20} aria-hidden />
                  </span>
                  邮箱
                </button>
              </div>

              {loginMethod === 'password' ? (
                <form className={styles.form} onSubmit={(e) => void onPasswordLogin(e)}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>邮箱</span>
                    <input
                      className={styles.input}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="您的邮箱地址"
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>密码</span>
                    <input
                      className={styles.input}
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      required
                    />
                  </label>

                  <div className={styles.formFooter}>
                    <label className={styles.rememberMe}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      记住我
                    </label>
                    <p className={styles.switchAuth}>
                      没有账号？
                      <Link to={registerPathFromSearch(searchParams)}>点击注册</Link>
                    </p>
                  </div>

                  {error ? <p className={styles.error}>{error}</p> : null}
                  {hint ? <p className={styles.hint}>{hint}</p> : null}

                  <button type="submit" className={styles.primaryBtn} disabled={busy}>
                    {busy ? '登录中…' : challengeId ? '登录并授权客户端' : '登录'}
                  </button>

                  {error?.includes('尚未验证') ? (
                    <p className={styles.secondaryLink}>
                      <button type="button" onClick={() => void onResendVerification()} disabled={busy}>
                        重发验证邮件
                      </button>
                    </p>
                  ) : null}
                </form>
              ) : (
                <form className={styles.form} onSubmit={(e) => void onSendLoginLink(e)}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>邮箱</span>
                    <input
                      className={styles.input}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="您的邮箱地址"
                      required
                    />
                  </label>

                  <div className={styles.formFooter}>
                    <label className={styles.rememberMe}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      记住我
                    </label>
                    <p className={styles.switchAuth}>
                      没有账号？
                      <Link to={registerPathFromSearch(searchParams)}>点击注册</Link>
                    </p>
                  </div>

                  {error ? <p className={styles.error}>{error}</p> : null}
                  {hint ? <p className={styles.hint}>{hint}</p> : null}

                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={busy || cooldown > 0}
                  >
                    {busy
                      ? '发送中…'
                      : cooldown > 0
                        ? `${cooldown}s`
                        : loginMailSent
                          ? '重新发送登录邮件'
                          : '发送登录邮件'}
                  </button>

                  {loginMailSent ? (
                    <p className={styles.hint}>
                      请查收邮件并点击「点击登录」。若使用 QQ 邮箱且链接无法打开，请复制邮件中的完整链接到浏览器地址栏。
                    </p>
                  ) : null}
                </form>
              )}
            </>
          )}
        </div>
      </div>

    </AuthShell>
  )
}
