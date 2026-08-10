/**
 * @file 概览页数据分析区块
 * @description 下载趋势、平台分布与 CSV 导出（7/14/30 天）
 * @author qiangcan
 * @date 2026-08-07
 */

import { useMemo, useState, type JSX } from 'react'
import { Icon } from '@dropvid/ui'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { BarChartSkeleton, TableSkeleton } from '../../components/Skeleton'
import { PlatformWithLabel } from '../../components/PlatformWithLabel'
import { useAuth } from '../../auth/AuthProvider'
import { useHistoryStats } from '../../hooks/useHistoryStats'
import { formatShortDate } from '../../utils/format'
import { exportDailyTrendCsv, exportPlatformStatsCsv } from '../../utils/exportCsv'
import styles from '../../layout/AccountLayout.module.css'

const RANGES = [7, 14, 30] as const

type ExportKey = 'daily' | 'platform'

export function OverviewAnalyticsSection(): JSX.Element {
  const { session } = useAuth()
  const { stats, loading, error, rangeDays, setRangeDays } = useHistoryStats()
  const [hoverDay, setHoverDay] = useState<number | null>(null)
  const [exportBusy, setExportBusy] = useState<ExportKey | null>(null)
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const maxCount = Math.max(1, ...(stats?.dailyTrend.map((d) => d.count) ?? [1]))
  const totalPlatforms = stats?.platformStats.reduce((sum, item) => sum + item.value, 0) ?? 0
  const periodCompleted =
    stats?.periodCompleted ??
    stats?.dailyTrend.reduce((sum, day) => sum + day.count, 0) ??
    0
  const periodStarred = stats?.periodStarred ?? 0
  const rangeHint = `近 ${rangeDays} 天`

  const platformColumns = useMemo((): DataTableColumn<{ platformId: string; value: number }>[] => {
    return [
      {
        key: 'platform',
        title: '平台',
        render: (row) => <PlatformWithLabel platformId={row.platformId} size={18} />
      },
      {
        key: 'value',
        title: '下载数'
      },
      {
        key: 'pct',
        title: '占比',
        render: (row) => {
          const pct = totalPlatforms > 0 ? Math.round((row.value / totalPlatforms) * 100) : 0
          return (
            <div className={styles.tablePct}>
              <div className={styles.tablePctBar}>
                <i style={{ width: `${pct}%` }} />
              </div>
              <span>{pct}%</span>
            </div>
          )
        }
      }
    ]
  }, [totalPlatforms])

  async function runExport(key: ExportKey): Promise<void> {
    if (!session) return
    setExportMsg(null)
    setExportBusy(key)
    try {
      if (key === 'daily') {
        if (!stats?.dailyTrend.length) {
          setExportMsg('暂无趋势数据可导出')
          return
        }
        exportDailyTrendCsv(stats)
      } else if (key === 'platform') {
        if (!stats?.platformStats.length) {
          setExportMsg('暂无平台数据可导出')
          return
        }
        exportPlatformStatsCsv(stats)
      }
      setExportMsg('已开始下载 CSV 文件')
    } catch (err) {
      setExportMsg(err instanceof Error ? err.message : '导出失败')
    } finally {
      setExportBusy(null)
    }
  }

  return (
    <>
      <div className={styles.analyticsToolbar}>
        <p className={styles.analyticsToolbarHint}>以下数据均按所选时间范围统计</p>
        <div className={styles.segmented} role="group" aria-label="时间范围">
          {RANGES.map((days) => (
            <button
              key={days}
              type="button"
              className={[
                styles.segmentBtn,
                rangeDays === days ? styles.segmentBtnActive : ''
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setRangeDays(days)}
            >
              {days} 天
            </button>
          ))}
        </div>
      </div>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div className={styles.panelHeadRow}>
            <div>
              <h2>下载趋势</h2>
              <p>{rangeHint}每日下载量，基于云端同步的已完成记录。</p>
            </div>
            <button
              type="button"
              className={styles.panelExportBtn}
              disabled={exportBusy !== null}
              onClick={() => void runExport('daily')}
            >
              <Icon name="export" size={13} />
              {exportBusy === 'daily' ? '导出中…' : '下载 CSV'}
            </button>
          </div>
        </header>

        {error ? <p className={styles.errorHint}>{error}</p> : null}
        {exportMsg ? <p className={styles.exportMsg}>{exportMsg}</p> : null}

        {loading && !stats ? (
          <BarChartSkeleton bars={rangeDays} />
        ) : stats && stats.dailyTrend.length > 0 ? (
          <div className={styles.chartWrap}>
            <div className={styles.barChart} aria-label="每日下载趋势">
              {stats.dailyTrend.map((day) => {
                const height = Math.round((day.count / maxCount) * 100)
                const active = hoverDay === day.dayStart
                return (
                  <div
                    key={day.dayStart}
                    className={styles.barCol}
                    onMouseEnter={() => setHoverDay(day.dayStart)}
                    onMouseLeave={() => setHoverDay(null)}
                  >
                    <div className={styles.barTooltip} data-show={active || undefined}>
                      {day.count} 次
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ height: `${Math.max(day.count > 0 ? 8 : 0, height)}%` }}
                      />
                    </div>
                    <span>{formatShortDate(day.dayStart)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className={styles.emptyHint}>
            暂无下载记录。在客户端完成下载并开启云同步后，数据会出现在这里。
          </p>
        )}
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div className={styles.panelHeadRow}>
            <div>
              <h2>平台分布</h2>
              <p>{rangeHint}各平台下载数量与占比。</p>
            </div>
            <button
              type="button"
              className={styles.panelExportBtn}
              disabled={exportBusy !== null}
              onClick={() => void runExport('platform')}
            >
              <Icon name="export" size={13} />
              {exportBusy === 'platform' ? '导出中…' : '下载 CSV'}
            </button>
          </div>
        </header>

        {loading && !stats ? (
          <TableSkeleton columns={3} rows={4} />
        ) : stats && stats.platformStats.length > 0 ? (
          <DataTable
            columns={platformColumns}
            data={stats.platformStats}
            rowKey={(row) => row.platformId}
            loading={loading}
            emptyHint="暂无平台数据"
            footer={
              <>
                <span>
                  {rangeHint}合计 {periodCompleted} 次
                </span>
                <span>收藏 {periodStarred} 条</span>
              </>
            }
          />
        ) : (
          <p className={styles.emptyHint}>暂无平台数据</p>
        )}
      </section>
    </>
  )
}
