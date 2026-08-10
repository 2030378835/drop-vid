/**
 * @file 账户区页面骨架屏
 * @description 概览、用量、历史等页面的加载占位布局
 * @author qiangcan
 * @date 2026-08-08
 */

import type { JSX } from 'react'
import layout from '../../layout/AccountLayout.module.css'
import { Skeleton } from './Skeleton'
import sk from './Skeleton.module.css'

/** 概览页顶部四格统计 */
export function StatRowSkeleton(): JSX.Element {
  return (
    <div className={layout.statRow}>
      {[88, 72, 64, 56].map((w) => (
        <div key={w} className={layout.statBox}>
          <Skeleton width={56} height={12} />
          <Skeleton width={w} height={22} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  )
}

/** Settings / 用量 字段行 */
export function FieldRowsSkeleton({ rows = 3 }: { rows?: number }): JSX.Element {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={layout.fieldRow}>
          <Skeleton width={72} height={13} />
          <Skeleton width={index === 0 ? '62%' : index === 1 ? '48%' : '36%'} height={14} />
        </div>
      ))}
    </>
  )
}

/** 用量页进度块 */
export function UsageBlocksSkeleton({ blocks = 2 }: { blocks?: number }): JSX.Element {
  return (
    <>
      {Array.from({ length: blocks }).map((_, index) => (
        <div key={index} className={sk.usageBlock}>
          <div className={sk.usageHead}>
            <Skeleton width={72} height={13} />
            <Skeleton width={96} height={14} />
          </div>
          <Skeleton width="100%" height={6} style={{ borderRadius: 999 }} />
          <Skeleton width="55%" height={12} style={{ marginTop: 10 }} />
        </div>
      ))}
    </>
  )
}

/** 数据分析工具栏右侧分段按钮占位 */
export function AnalyticsToolbarSkeleton(): JSX.Element {
  return (
    <div className={layout.analyticsToolbar}>
      <Skeleton width={180} height={13} />
      <Skeleton width={132} height={32} style={{ borderRadius: 8 }} />
    </div>
  )
}

/** 柱状图占位 */
export function BarChartSkeleton({ bars = 7 }: { bars?: number }): JSX.Element {
  const heights = [42, 68, 35, 82, 56, 74, 48]
  return (
    <div className={layout.chartWrap}>
      <div className={sk.barChart}>
        {Array.from({ length: bars }).map((_, index) => (
          <div key={index} className={sk.barCol}>
            <Skeleton
              className={sk.barFill}
              width="100%"
              height={`${heights[index % heights.length]}%`}
            />
            <Skeleton width={28} height={10} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** 热力图网格占位 */
export function HeatmapSkeleton(): JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className={sk.heatmapGrid}>
        {Array.from({ length: 26 * 7 }).map((_, index) => (
          <Skeleton key={index} className={sk.heatmapCell} width="100%" height="100%" />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {[72, 64, 56, 56].map((w) => (
          <div key={w} style={{ display: 'grid', gap: 6 }}>
            <Skeleton width={56} height={11} />
            <Skeleton width={w} height={16} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** 表格占位 */
export function TableSkeleton({
  columns = 4,
  rows = 5
}: {
  columns?: number
  rows?: number
}): JSX.Element {
  const colWidths = ['68%', '42%', '36%', '28%']
  return (
    <div className={sk.table} style={{ ['--sk-cols' as string]: columns }}>
      <div className={sk.tableHead}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} width={52 + index * 8} height={12} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={sk.tableRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              width={colWidths[colIndex % colWidths.length]}
              height={14}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** 登录设备列表占位 */
export function DeviceListSkeleton({ rows = 3 }: { rows?: number }): JSX.Element {
  return (
    <ul className={layout.deviceList}>
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className={sk.deviceRow}>
          <div className={sk.deviceMain}>
            <Skeleton width={index === 0 ? '42%' : '36%'} height={14} />
            <Skeleton width="58%" height={12} />
          </div>
          <Skeleton width={48} height={24} style={{ borderRadius: 6, flexShrink: 0 }} />
        </li>
      ))}
    </ul>
  )
}
