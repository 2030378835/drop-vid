/**
 * @file 官网登录页
 * @description GitHub / 邮箱登录；支持 ?challenge= 为桌面客户端授权
 * @author qiangcan
 * @date 2026-08-08
 */

import { useEffect, useState, type FormEvent, type JSX } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@dropvid/ui'
import {
  completeClientLoginChallenge,
  getGitHubOAuthStartUrl,
  peekClientLoginChallenge,
  sendLoginCode,
  verifyLoginCode
} from '../../api/auth'
import { useAuth } from '../../auth/AuthProvider'
import { LEGAL_DOCUMENT_CODES } from '../../api/legalDocuments'
import { LegalDocumentModal } from '../../components/LegalDocumentModal'
import { useLegalDocumentViewer } from '../../hooks/useLegalDocumentViewer'
import { ACCOUNT_HOME_PATH } from '../../routes/paths'
import { AuthShell } from './AuthShell'
import styles from './LoginPage.module.css'

export function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const challengeId = searchParams.get('challenge')?.trim() || ''
  const oauthError = searchParams.get('oauth_error')?.trim() || ''

  const { session, loading, setSessionFromTokens } = useAuth()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(oauthError || null)
  const [hint, setHint] = useState<string | null>(null)

  const [clientLabel, setClientLabel] = useState<string | null>(null)
  const [clientDone, setClientDone] = useState(false)

  const {
    viewCode,
    loading: legalLoading,
    error: legalError,
    activeDocument,
    openLegalDocument,
    closeLegalDocument
  } = useLegalDocumentViewer()

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

  useEffect(() => {
    if (oauthError) setError(oauthError)
  }, [oauthError])

  const onGitHubLogin = (): void => {
    window.location.assign(getGitHubOAuthStartUrl(challengeId || undefined))
  }

  if (!loading && session && !challengeId) {
    return <Navigate to={ACCOUNT_HOME_PATH} replace />
  }

  const completeForClient = async (accessToken: string, sessionId?: string): Promise<void> => {
    if (!challengeId) return
    await completeClientLoginChallenge(challengeId, accessToken, sessionId)
    setClientDone(true)
    setHint('已授权桌面客户端登录，请返回 DropVid 应用。')
  }

  const onOneClickClientLogin = async (): Promise<void> => {
    if (!session?.accessToken || !challengeId) return
    setError(null)
    setBusy(true)
    try {
      await completeForClient(session.accessToken, session.sessionId)
    } catch (e) {
      setError(e instanceof Error ? e.message : '授权失败')
    } finally {
      setBusy(false)
    }
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
          ? '验证码已发送，验证通过后将自动完成注册。'
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
    if (!email.trim()) {
      setError('请输入邮箱')
      return
    }
    if (!codeSent) {
      await onSendCode()
      return
    }
    if (!code.trim() || code.trim().length !== 6) {
      setError('请输入 6 位验证码')
      return
    }
    setBusy(true)
    try {
      const tokens = await verifyLoginCode(email, code)
      await setSessionFromTokens(tokens)
      if (challengeId) {
        await completeForClient(tokens.accessToken, tokens.sessionId)
        return
      }
      navigate(ACCOUNT_HOME_PATH, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败')
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
    <AuthShell
      onOpenTerms={() => openLegalDocument(LEGAL_DOCUMENT_CODES.terms)}
      onOpenPrivacy={() => openLegalDocument(LEGAL_DOCUMENT_CODES.privacy)}
    >
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
              <button
                type="button"
                className={styles.oauthBtn}
                disabled={busy}
                onClick={onGitHubLogin}
              >
                <Icon name="github" size={18} aria-hidden />
                使用 GitHub 登录
              </button>

              <div className={styles.divider} role="separator">
                <span>或使用邮箱</span>
              </div>

              <form className={styles.form} onSubmit={(e) => void onVerify(e)}>
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

                {codeSent ? (
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>验证码</span>
                    <div className={styles.codeRow}>
                      <input
                        className={styles.input}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6 位数字"
                        required
                      />
                      <button
                        type="button"
                        className={styles.sendBtn}
                        disabled={busy || cooldown > 0}
                        onClick={() => void onSendCode()}
                      >
                        {cooldown > 0 ? `${cooldown}s` : '重新发送'}
                      </button>
                    </div>
                  </div>
                ) : null}

                {error ? <p className={styles.error}>{error}</p> : null}
                {hint ? <p className={styles.hint}>{hint}</p> : null}

                <button type="submit" className={styles.primaryBtn} disabled={busy}>
                  {busy
                    ? '处理中…'
                    : codeSent
                      ? challengeId
                        ? '登录并授权客户端'
                        : '登录 / 注册'
                      : '使用电子邮件继续'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <LegalDocumentModal
        open={viewCode !== null}
        loading={legalLoading}
        error={legalError}
        document={activeDocument}
        onClose={closeLegalDocument}
      />
    </AuthShell>
  )
}
