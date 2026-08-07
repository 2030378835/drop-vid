/**
 * @file 账户设置页
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { formatDateTime } from '../../utils/format'
import styles from '../../layout/AccountLayout.module.css'

export function SettingsPage(): JSX.Element {
  const { me, loading, logout, session } = useAuth()
  const email = me?.user.email || session?.user.email || '—'
  const plan = me?.plan === 'pro' ? 'Pro' : '免费版'
  const joined = me?.user.createdAt ? formatDateTime(me.user.createdAt) : '—'

  return (
    <>
      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h2>账户信息</h2>
        </header>

        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>邮箱</span>
          <span className={styles.fieldValue}>{email}</span>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>注册时间</span>
          <span className={styles.fieldValue}>{loading && !me ? '…' : joined}</span>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>套餐</span>
          <span className={styles.fieldValue}>
            {loading && !me ? '…' : plan}
            {me?.plan !== 'pro' ? (
              <>
                {' · '}
                <Link className={styles.inlineLink} to="/pricing">
                  查看 Pro
                </Link>
              </>
            ) : null}
          </span>
        </div>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h2>会话</h2>
          <p>退出后需重新登录；桌面客户端不受影响。</p>
        </header>
        <div className={styles.panelFoot}>
          <button type="button" className={styles.dangerBtn} onClick={() => void logout()}>
            退出登录
          </button>
        </div>
      </section>
    </>
  )
}
