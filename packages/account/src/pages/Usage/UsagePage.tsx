/**
 * @file 用量页
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { FieldRowsSkeleton, UsageBlocksSkeleton } from '../../components/Skeleton'
import { formatQuotaLimit } from '../../utils/format'
import styles from '../../layout/AccountLayout.module.css'

function UsageMeter({
  label,
  used,
  limit,
  remaining,
  resetPolicy = 'daily'
}: {
  label: string
  used: number
  limit: number
  remaining: number
  /** daily：每日零点重置；total：账户累计上限，不随日期重置 */
  resetPolicy?: 'daily' | 'total'
}): JSX.Element {
  const unlimited = limit < 0
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const unit = resetPolicy === 'daily' ? '次' : '条'

  return (
    <div className={styles.usageBlock}>
      <div className={styles.usageHead}>
        <span>{label}</span>
        <strong>
          {unlimited
            ? `${used} ${unit}（不限）`
            : `${used} / ${formatQuotaLimit(limit)}`}
        </strong>
      </div>
      {!unlimited ? (
        <>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <p className={styles.usageHint}>
            {resetPolicy === 'daily'
              ? `今日剩余 ${Math.max(0, remaining)} 次，每日 0 点重置。`
              : `还可同步 ${Math.max(0, remaining)} 条，为账户累计上限，不随日期重置。`}
          </p>
        </>
      ) : (
        <p className={styles.usageHint}>
          {resetPolicy === 'daily'
            ? '当前套餐不限制每日下载次数。'
            : '当前套餐不限制云历史条目数量。'}
        </p>
      )}
    </div>
  )
}

export function UsagePage(): JSX.Element {
  const { me, loading } = useAuth()
  const plan = me?.plan === 'pro' ? 'Pro' : '免费版'

  return (
    <>
      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h2>套餐与额度</h2>
          <p>下载次数按自然日计算，每日 0 点重置；云历史为账户内累计同步上限。</p>
        </header>

        {loading && !me ? (
          <FieldRowsSkeleton rows={1} />
        ) : (
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>当前套餐</span>
            <span className={styles.fieldValue}>
              {plan}
              {me?.plan !== 'pro' ? (
                <>
                  {' '}
                  <Link className={styles.inlineLink} to="/pricing">
                    升级
                  </Link>
                </>
              ) : null}
            </span>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h2>使用情况</h2>
        </header>

        {loading && !me ? (
          <UsageBlocksSkeleton blocks={2} />
        ) : me ? (
          <>
            <UsageMeter
              label="今日下载"
              used={me.quota.used}
              limit={me.quota.limit}
              remaining={me.quota.remaining}
            />
            <UsageMeter
              label="云历史条目"
              used={me.cloudHistory.used}
              limit={me.cloudHistory.limit}
              remaining={me.cloudHistory.remaining}
              resetPolicy="total"
            />
          </>
        ) : (
          <p className={styles.emptyHint}>暂无数据</p>
        )}
      </section>
    </>
  )
}
