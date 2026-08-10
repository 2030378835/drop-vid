/**
 * @file 概览页
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { DownloadHeatmap } from '../../components/DownloadHeatmap'
import { StatRowSkeleton, FieldRowsSkeleton, HeatmapSkeleton, Skeleton } from '../../components/Skeleton'
import { useAuth } from '../../auth/AuthProvider'
import { useHistoryStats } from '../../hooks/useHistoryStats'
import { formatQuotaLimit } from '../../utils/format'
import { OverviewAnalyticsSection } from './OverviewAnalyticsSection'
import styles from '../../layout/AccountLayout.module.css'

export function OverviewPage(): JSX.Element {
  const { me, loading } = useAuth()
  const { stats, loading: statsLoading } = useHistoryStats(365)

  const plan = me?.plan === 'pro' ? 'Pro' : '免费版'
  const quotaUsed = me?.quota.used ?? 0
  const quotaLimit = me?.quota.limit ?? 0
  const quotaPct =
    quotaLimit > 0 ? Math.min(100, Math.round((quotaUsed / quotaLimit) * 100)) : 0
  const periodTotal = stats?.dailyTrend.reduce((sum, day) => sum + day.count, 0) ?? 0
  const hasHeatmapData = stats?.dailyTrend.some((day) => day.count > 0) ?? false

  return (
    <>
      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div className={styles.panelHeadRow}>
            <div>
              <h2>账户概览</h2>
              <p>今日用量与云端下载概况。</p>
            </div>
            {me?.plan !== 'pro' ? (
              <div className={styles.panelHeadActions}>
                <Link className={styles.linkBtn} to="/pricing">
                  升级 Pro
                </Link>
              </div>
            ) : null}
          </div>
        </header>

        {(loading && !me) || (statsLoading && !stats) ? (
          <StatRowSkeleton />
        ) : (
          <div className={styles.statRow}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>当前套餐</span>
              <strong className={styles.statValue}>{plan}</strong>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>今日下载</span>
              <strong className={styles.statValue}>
                {quotaLimit < 0
                  ? `${quotaUsed} 次`
                  : `${quotaUsed} / ${formatQuotaLimit(quotaLimit)}`}
              </strong>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>累计完成</span>
              <strong className={styles.statValue}>{stats?.totalCompleted ?? 0}</strong>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>本周下载</span>
              <strong className={styles.statValue}>{stats?.thisWeekCount ?? 0}</strong>
            </div>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div className={`${styles.panelHeadRow} ${styles.panelHeadRowAlignEnd}`}>
            <div>
              <h2>下载活动</h2>
              <p>近一年每日下载记录，颜色越深表示下载越多。</p>
            </div>
            {statsLoading && !stats ? (
              <div className={styles.heatmapMetric}>
                <span className={styles.heatmapMetricLabel}>近一年累计</span>
                <Skeleton width={72} height={28} style={{ marginTop: 4, marginLeft: 'auto' }} />
              </div>
            ) : hasHeatmapData ? (
              <div className={styles.heatmapMetric}>
                <span className={styles.heatmapMetricLabel}>近一年累计</span>
                <strong className={styles.heatmapMetricValue}>
                  {periodTotal.toLocaleString('zh-CN')}
                  <small> 次</small>
                </strong>
              </div>
            ) : null}
          </div>
        </header>
        {statsLoading && !stats ? (
          <HeatmapSkeleton />
        ) : (
          <DownloadHeatmap dailyTrend={stats?.dailyTrend ?? []} loading={false} />
        )}
      </section>

      <OverviewAnalyticsSection />

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h2>额度概况</h2>
          <p>下载次数每日 0 点重置；云历史为账户累计同步上限。</p>
        </header>
        {loading && !me ? (
          <FieldRowsSkeleton rows={2} />
        ) : (
          <>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>今日下载</span>
              <div className={styles.fieldValue}>
                {me && quotaLimit >= 0 ? (
                  <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${quotaPct}%` }} />
                    </div>
                    <span className={styles.progressText}>
                      剩余 {Math.max(0, me.quota.remaining)} 次
                    </span>
                  </div>
                ) : (
                  <span>{me ? '不限次数' : '—'}</span>
                )}
              </div>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>云历史条目</span>
              <span className={styles.fieldValue}>
                {me
                  ? me.cloudHistory.limit < 0
                    ? `已同步 ${me.cloudHistory.used} 条`
                    : `${me.cloudHistory.used} / ${me.cloudHistory.limit}（累计）`
                  : '—'}
              </span>
            </div>
          </>
        )}
        {me?.plan !== 'pro' ? (
          <div className={styles.panelFoot}>
            <Link className={styles.linkBtn} to="/pricing">
              了解 Pro 套餐
            </Link>
          </div>
        ) : null}
      </section>
    </>
  )
}
