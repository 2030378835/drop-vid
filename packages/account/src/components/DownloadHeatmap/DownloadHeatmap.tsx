/**
 * @file 每日下载热力图
 * @description 概览页 GitHub 式下载活动网格
 * @author qiangcan
 * @date 2026-08-07
 */

import { useMemo, useState, type CSSProperties, type JSX } from 'react'
import {
  buildHeatmapWeeks,
  computeHeatmapSummary,
  formatHeatmapTooltip,
  getHeatLevel,
  getHeatmapMonthLabels,
  getHeatmapTooltipContent
} from '../../utils/heatmap'
import styles from './DownloadHeatmap.module.css'

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const

type TooltipState = {
  dayStart: number
  count: number
  x: number
  y: number
}

type DownloadHeatmapProps = {
  dailyTrend: Array<{ dayStart: number; count: number }>
  loading?: boolean
}

export function DownloadHeatmap({ dailyTrend, loading }: DownloadHeatmapProps): JSX.Element {
  const weeks = useMemo(() => buildHeatmapWeeks(dailyTrend), [dailyTrend])
  const monthLabels = useMemo(() => getHeatmapMonthLabels(weeks), [weeks])
  const summary = useMemo(() => computeHeatmapSummary(dailyTrend), [dailyTrend])
  const maxCount = useMemo(
    () => Math.max(0, ...dailyTrend.map((day) => day.count)),
    [dailyTrend]
  )
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const hasData = dailyTrend.some((day) => day.count > 0)
  const gridStyle = {
    '--week-count': weeks.length,
    '--cell-gap': '3px',
    '--heat-0': '#eef0f3',
    '--heat-1': '#ccebd8',
    '--heat-2': '#7cc998',
    '--heat-3': '#39a86b',
    '--heat-4': '#1a7f42'
  } as CSSProperties

  /** 更新悬停格子上方的 tooltip 位置 */
  function showTooltip(dayStart: number, count: number, target: HTMLElement): void {
    const rect = target.getBoundingClientRect()
    setTooltip({
      dayStart,
      count,
      x: rect.left + rect.width / 2,
      y: rect.top
    })
  }

  if (loading && dailyTrend.length === 0) {
    return <p className={styles.emptyHint}>加载中…</p>
  }

  if (!hasData) {
    return (
      <p className={styles.emptyHint}>
        暂无下载记录。在客户端完成下载并开启云同步后，活动会显示在这里。
      </p>
    )
  }

  const tooltipContent = tooltip ? getHeatmapTooltipContent(tooltip.dayStart, tooltip.count) : null

  return (
    <div className={styles.root} style={gridStyle}>
      <div className={styles.scrollWrap}>
        <div className={styles.heatmap} role="grid" aria-label="每日下载热力图">
          {monthLabels.map((label, weekIndex) => (
            <span
              key={`month-${weekIndex}`}
              className={styles.monthLabel}
              style={{ gridColumn: weekIndex + 2, gridRow: 1 }}
            >
              {label ?? ''}
            </span>
          ))}

          {WEEKDAY_LABELS.map((label, dayIndex) => (
            <span
              key={`weekday-${label}`}
              className={styles.weekdayLabel}
              style={{ gridColumn: 1, gridRow: dayIndex + 2 }}
              aria-hidden={dayIndex % 2 !== 1}
            >
              {dayIndex % 2 === 1 ? label : ''}
            </span>
          ))}

          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const gridColumn = weekIndex + 2
              const gridRow = dayIndex + 2
              const cellKey = day.dayStart ?? `pad-${weekIndex}-${dayIndex}`

              if (day.dayStart === null) {
                return (
                  <span
                    key={cellKey}
                    className={styles.cell}
                    data-empty
                    style={{ gridColumn, gridRow }}
                  />
                )
              }

              const level = getHeatLevel(day.count, maxCount)
              const ariaLabel = formatHeatmapTooltip(day.dayStart, day.count)
              return (
                <button
                  key={cellKey}
                  type="button"
                  className={styles.cell}
                  data-level={level}
                  style={{ gridColumn, gridRow }}
                  aria-label={ariaLabel}
                  onMouseEnter={(event) => showTooltip(day.dayStart!, day.count, event.currentTarget)}
                  onMouseMove={(event) => showTooltip(day.dayStart!, day.count, event.currentTarget)}
                  onMouseLeave={() => setTooltip(null)}
                  onBlur={() => setTooltip(null)}
                  onFocus={(event) => showTooltip(day.dayStart!, day.count, event.currentTarget)}
                />
              )
            })
          )}
        </div>

        {tooltip && tooltipContent ? (
          <div
            className={styles.tooltip}
            role="tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <span className={styles.tooltipDate}>{tooltipContent.date}</span>
            <span className={styles.tooltipCount}>{tooltipContent.countText}</span>
          </div>
        ) : null}
      </div>

      <footer className={styles.foot}>
        <div className={styles.summaryRow}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>最活跃月份</span>
            <strong className={styles.summaryValue}>{summary.mostActiveMonth ?? '—'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>最活跃日</span>
            <strong className={styles.summaryValue}>{summary.mostActiveDay ?? '—'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>最长连续</span>
            <strong className={styles.summaryValue}>
              {summary.longestStreak > 0 ? `${summary.longestStreak} 天` : '—'}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>当前连续</span>
            <strong className={styles.summaryValue}>
              {summary.currentStreak > 0 ? `${summary.currentStreak} 天` : '—'}
            </strong>
          </div>
        </div>

        <div className={styles.legend} aria-hidden>
          <span>少</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={styles.legendSwatch} data-level={level} />
          ))}
          <span>多</span>
        </div>
      </footer>
    </div>
  )
}
