/**
 * @file 官网注册页
 * @description 密码注册并发送邮箱验证；支持 ?challenge= 客户端授权
 * @author qiangcan
 * @date 2026-08-08
 */

import { useEffect, useState, type FormEvent, type JSX } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { registerWithPassword, resendVerificationEmail } from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { AuthShell } from './AuthShell'
import styles from './LoginPage.module.css'

/** 带 query 的登录页路径（保留 challenge 等参数） */
function loginPathFromSearch(searchParams: URLSearchParams): string {
  const qs = searchParams.toString()
  return qs ? `/login?${qs}` : '/login'
}

export function RegisterPage(): JSX.Element {
  const [searchParams] = useSearchParams()
  const challengeId = searchParams.get('challenge')?.trim() || ''

  const { session, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [registerMailSent, setRegisterMailSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])

  if (!loading && session && !challengeId) {
    return <Navigate to={ACCOUNT_HOME_PATH} replace />
  }

  const resetMessages = (): void => {
    setError(null)
    setHint(null)
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
      setRegisterMailSent(true)
      setCooldown(60)
      setHint(result.message || '验证邮件已重新发送，请在 5 分钟内完成验证。')
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败')
    } finally {
      setBusy(false)
    }
  }

  const onRegister = async (event: FormEvent): Promise<void> => {
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
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (registerMailSent && cooldown <= 0) {
      await onResendVerification()
      return
    }
    if (cooldown > 0) return

    setBusy(true)
    try {
      const result = await registerWithPassword({
        email,
        password,
        confirmPassword,
        challengeId: challengeId || undefined
      })
      setRegisterMailSent(true)
      setCooldown(60)
      setHint(result.message || '验证邮件已发送，请在 5 分钟内点击邮件中的链接完成注册。')
    } catch (e) {
      setError(e instanceof Error ? e.message : '注册失败')
    } finally {
      setBusy(false)
    }
  }

  const title = challengeId ? '注册并授权 DropVid 客户端' : '注册 DropVid'
  const subtitle = challengeId
    ? '验证邮箱后将自动完成桌面客户端授权'
    : '创建账户并同步云端记录'

  return (
    <AuthShell>
      <div className={styles.stack}>
        <header className={styles.hero}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        <div className={styles.body}>
          <form className={styles.form} onSubmit={(e) => void onRegister(e)}>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 位"
                minLength={8}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>确认密码</span>
              <input
                className={styles.input}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                minLength={8}
                required
              />
            </label>

            <div className={styles.formFooter}>
              <span />
              <p className={styles.switchAuth}>
                已有账号？
                <Link to={loginPathFromSearch(searchParams)}>点击登录</Link>
              </p>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}
            {hint ? <p className={styles.hint}>{hint}</p> : null}

            <button type="submit" className={styles.primaryBtn} disabled={busy || cooldown > 0}>
              {busy
                ? '发送中…'
                : cooldown > 0
                  ? `${cooldown}s`
                  : registerMailSent
                    ? '重新发送验证邮件'
                    : '发送邮箱验证'}
            </button>

            {registerMailSent ? (
              <p className={styles.hint}>请查收邮件并点击验证链接；验证成功后将自动完成注册。</p>
            ) : null}
          </form>
        </div>
      </div>
    </AuthShell>
  )
}
