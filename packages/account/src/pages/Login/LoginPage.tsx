/**
 * @file 官网登录页
 * @description 默认邮箱验证码；可切换「DropVid 客户端确认登录」
 * @author qiangcan
 * @date 2026-08-07
 */

import { useEffect, useRef, useState, type FormEvent, type JSX } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  createLoginChallenge,
  pollLoginChallenge,
  sendLoginCode,
  verifyLoginCode
} from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { AuthShell } from './AuthShell'
import { Icon } from '@dropvid/ui'
import styles from './LoginPage.module.css'

type Mode = 'email' | 'client'

export function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const { session, loading, setSessionFromTokens } = useAuth()
  const [mode, setMode] = useState<Mode>('email')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const [clientStatus, setClientStatus] = useState<string | null>(null)
  const pollTimer = useRef<number | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current)
    }
  }, [])

  if (!loading && session) {
    return <Navigate to={ACCOUNT_HOME_PATH} replace />
  }

  const onSendCode = async (): Promise<void> => {
    setError(null)
    setHint(null)
    if (!email.trim()) {
      setError('请输入邮箱')
      return
    }
    setBusy(true)
    try {
      const result = await sendLoginCode(email)
      setCodeSent(true)
      setCooldown(60)
      setHint(
        result.isNewUser
          ? '验证码已发送。验证通过后将自动完成注册。'
          : '验证码已发送，请查收邮箱。'
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败')
    } finally {
      setBusy(false)
    }
  }

  const onVerify = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setError(null)
    if (!code.trim() || code.trim().length !== 6) {
      setError('请输入 6 位验证码')
      return
    }
    setBusy(true)
    try {
      const tokens = await verifyLoginCode(email, code)
      await setSessionFromTokens(tokens)
      navigate(ACCOUNT_HOME_PATH, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败')
    } finally {
      setBusy(false)
    }
  }

  const stopPolling = (): void => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }

  const onStartClientLogin = async (): Promise<void> => {
    setError(null)
    setClientStatus(null)
    stopPolling()
    setBusy(true)
    try {
      const challenge = await createLoginChallenge()
      setClientStatus('正在打开 DropVid 客户端…')
      // 尝试唤醒本地客户端
      window.location.href = challenge.deepLink

      setClientStatus('请在 DropVid 客户端中确认登录。若未安装，请先下载客户端。')
      pollTimer.current = window.setInterval(() => {
        void (async () => {
          try {
            const polled = await pollLoginChallenge(challenge.challengeId)
            if (polled.status === 'approved' && polled.tokens) {
              stopPolling()
              await setSessionFromTokens(polled.tokens)
              navigate(ACCOUNT_HOME_PATH, { replace: true })
              return
            }
            if (polled.status === 'denied') {
              stopPolling()
              setBusy(false)
              setError('已在客户端拒绝本次登录')
              setClientStatus(null)
              return
            }
            if (polled.status === 'expired' || polled.expiresIn <= 0) {
              stopPolling()
              setBusy(false)
              setError('确认已超时，请重试')
              setClientStatus(null)
            }
          } catch (e) {
            stopPolling()
            setBusy(false)
            setError(e instanceof Error ? e.message : '轮询失败')
            setClientStatus(null)
          }
        })()
      }, challenge.pollIntervalMs)
    } catch (e) {
      setError(e instanceof Error ? e.message : '无法发起客户端确认')
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <section className={styles.card}>
          <p className={styles.kicker}>账户</p>
          <h1 className={styles.title}>登录 DropVid</h1>
          <p className={styles.desc}>默认使用邮箱验证码。也可像微信网页版一样，用客户端一键确认。</p>

          <div className={styles.tabs} role="tablist" aria-label="登录方式">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'email'}
              className={`${styles.tab} ${mode === 'email' ? styles.tabActive : ''}`}
              onClick={() => {
                stopPolling()
                setMode('email')
                setError(null)
                setClientStatus(null)
                setBusy(false)
              }}
            >
              邮箱验证码
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'client'}
              className={`${styles.tab} ${mode === 'client' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('client')
                setError(null)
                setHint(null)
              }}
            >
              客户端确认
            </button>
          </div>

          {mode === 'email' ? (
            <form className={styles.form} onSubmit={(e) => void onVerify(e)}>
              <label className={styles.field}>
                <span>邮箱</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </label>

              <div className={styles.codeRow}>
                <label className={styles.field}>
                  <span>验证码</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6 位数字"
                    required={codeSent}
                  />
                </label>
                <button
                  type="button"
                  className={styles.sendBtn}
                  disabled={busy || cooldown > 0}
                  onClick={() => void onSendCode()}
                >
                  {cooldown > 0 ? `${cooldown}s` : codeSent ? '重新发送' : '获取验证码'}
                </button>
              </div>

              {hint ? <p className={styles.hint}>{hint}</p> : null}
              {error ? <p className={styles.error}>{error}</p> : null}

              <button type="submit" className={styles.submit} disabled={busy || !codeSent}>
                {busy ? '登录中…' : '登录 / 注册'}
              </button>
            </form>
          ) : (
            <div className={styles.clientPane}>
              <p className={styles.clientLead}>
                点击下方按钮将唤醒本机 DropVid。请在客户端弹窗中确认，即可完成官网登录。
              </p>
              <button
                type="button"
                className={styles.submit}
                disabled={busy}
                onClick={() => void onStartClientLogin()}
              >
                <Icon name="devices" size={16} />
                <span>{busy ? '等待客户端确认…' : '打开 DropVid 确认登录'}</span>
              </button>
              {clientStatus ? <p className={styles.hint}>{clientStatus}</p> : null}
              {error ? <p className={styles.error}>{error}</p> : null}
              <p className={styles.clientFoot}>
                尚未安装？
                <Link to={{ pathname: '/', hash: 'download' }}>前往下载</Link>
              </p>
            </div>
          )}
        </section>
    </AuthShell>
  )
}
