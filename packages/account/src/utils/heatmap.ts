/**
 * @file 下载热力图工具
 * @description 将每日趋势转为 GitHub 式周列网格，并计算摘要统计
 * @author qiangcan
 * @date 2026-08-07
 */

const DAY_MS = 86_400_000

export type HeatmapDay = {
  dayStart: number | null
  count: number
}

export type HeatmapWeek = HeatmapDay[]

export type HeatmapSummary = {
  periodTotal: number
  mostActiveMonth: string | null
  mostActiveDay: string | null
  longestStreak: number
  currentStreak: number
}

/** 将连续日数据排成按周分列的热力图（周日为首列） */
export function buildHeatmapWeeks(
  dailyTrend: Array<{ dayStart: number; count: number }>
): HeatmapWeek[] {
  if (dailyTrend.length === 0) return []

  const firstDay = dailyTrend[0].dayStart
  const leadingPad = new Date(firstDay).getDay()

  const cells: HeatmapDay[] = []
  for (let i = 0; i < leadingPad; i += 1) {
    cells.push({ dayStart: null, count: 0 })
  }
  for (const day of dailyTrend) {
    cells.push({ dayStart: day.dayStart, count: day.count })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ dayStart: null, count: 0 })
  }

  const weeks: HeatmapWeek[] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

/** 根据当日下载量映射颜色等级（0–4） */
export function getHeatLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || maxCount <= 0) return 0
  const ratio = count / maxCount
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

/** 计算热力图摘要：总量、最活跃月/日、连续下载天数 */
export function computeHeatmapSummary(
  dailyTrend: Array<{ dayStart: number; count: number }>
): HeatmapSummary {
  const periodTotal = dailyTrend.reduce((sum, day) => sum + day.count, 0)

  const monthCounts = new Map<number, number>()
  let peakDay = { dayStart: 0, count: 0 }
  for (const day of dailyTrend) {
    if (day.count <= 0) continue
    const month = new Date(day.dayStart).getMonth()
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + day.count)
    if (day.count > peakDay.count) peakDay = day
  }

  let mostActiveMonth: string | null = null
  let peakMonthCount = 0
  for (const [month, count] of monthCounts) {
    if (count > peakMonthCount) {
      peakMonthCount = count
      mostActiveMonth = `${month + 1} 月`
    }
  }

  const mostActiveDay =
    peakDay.count > 0
      ? new Date(peakDay.dayStart).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : null

  const { longestStreak, currentStreak } = calcDownloadStreaks(dailyTrend)

  return {
    periodTotal,
    mostActiveMonth,
    mostActiveDay,
    longestStreak,
    currentStreak
  }
}

/** 每列顶部的月份标签（该周含当月 1–7 日时显示） */
export function getHeatmapMonthLabels(weeks: HeatmapWeek[]): Array<string | null> {
  const seen = new Set<string>()

  return weeks.map((week) => {
    for (const day of week) {
      if (day.dayStart === null) continue
      const date = new Date(day.dayStart)
      if (date.getDate() > 7) continue
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (seen.has(key)) continue
      seen.add(key)
      return String(date.getMonth() + 1)
    }
    return null
  })
}

/** 格式化格子悬停文案（无障碍） */
export function formatHeatmapTooltip(dayStart: number, count: number): string {
  const { date, countText } = getHeatmapTooltipContent(dayStart, count)
  return `${date}：${countText}`
}

/** 悬停提示的分行内容 */
export function getHeatmapTooltipContent(
  dayStart: number,
  count: number
): { date: string; countText: string } {
  const date = new Date(dayStart).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const countText = count > 0 ? `${count} 次下载` : '无下载'
  return { date, countText }
}

function calcDownloadStreaks(
  dailyTrend: Array<{ dayStart: number; count: number }>
): { longestStreak: number; currentStreak: number } {
  let longestStreak = 0
  let run = 0

  for (let i = 0; i < dailyTrend.length; i += 1) {
    const day = dailyTrend[i]
    if (day.count > 0) {
      const prev = dailyTrend[i - 1]
      if (prev?.count > 0 && day.dayStart - prev.dayStart === DAY_MS) {
        run += 1
      } else {
        run = 1
      }
      longestStreak = Math.max(longestStreak, run)
    } else {
      run = 0
    }
  }

  let currentStreak = 0
  for (let i = dailyTrend.length - 1; i >= 0; i -= 1) {
    const day = dailyTrend[i]
    if (day.count > 0) {
      const next = dailyTrend[i + 1]
      if (next && next.count > 0 && next.dayStart - day.dayStart !== DAY_MS) break
      currentStreak += 1
    } else if (i === dailyTrend.length - 1) {
      continue
    } else {
      break
    }
  }

  return { longestStreak, currentStreak }
}
