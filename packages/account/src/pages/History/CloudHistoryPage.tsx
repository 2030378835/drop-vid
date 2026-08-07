/**
 * @file 云端历史页
 * @description 云同步下载记录列表与 CSV 导出
 * @author qiangcan
 * @date 2026-08-07
 */

import { useState, type JSX } from 'react'
import { Icon } from '@dropvid/ui'
import { DataTable } from '../../components/DataTable'
import { fetchAllCloudHistory } from '../../api/history'
import { useAuth } from '../../auth/AuthProvider'
import { useCloudHistoryPage } from '../../hooks/useCloudHistoryPage'
import { cloudHistoryColumns } from '../../utils/cloudHistoryColumns'
import { exportHistoryCsv } from '../../utils/exportCsv'
import styles from '../../layout/AccountLayout.module.css'

const RANGES = [7, 14, 30] as const
const PAGE_SIZE = 15
const HISTORY_COLUMNS = cloudHistoryColumns()

export function CloudHistoryPage(): JSX.Element {
  const { session } = useAuth()
  const [rangeDays, setRangeDays] = useState<(typeof RANGES)[number]>(14)
  const [page, setPage] = useState(1)
  const { items, total, totalAll, loading, error, reload } = useCloudHistoryPage(
    page,
    rangeDays,
    PAGE_SIZE
  )
  const [exportBusy, setExportBusy] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const rangeHint = `近 ${rangeDays} 天`

  function handleRangeChange(days: (typeof RANGES)[number]): void {
    setRangeDays(days)
    setPage(1)
  }

  async function runExport(): Promise<void> {
    if (!session) return
    setExportMsg(null)
    setExportBusy(true)
    try {
      const allItems = await fetchAllCloudHistory(session.accessToken, session.sessionId)
      if (allItems.length === 0) {
        setExportMsg('暂无历史记录可导出')
        return
      }
      exportHistoryCsv(allItems)
      setExportMsg('已开始下载 CSV 文件')
    } catch (err) {
      setExportMsg(err instanceof Error ? err.message : '导出失败')
    } finally {
      setExportBusy(false)
    }
  }

  const tableFooter =
    total > 0 ? (
      <>
        <span>
          {rangeHint}筛选结果 {total} 条
        </span>
        {totalAll > total ? <span>账户累计 {totalAll} 条</span> : null}
      </>
    ) : undefined

  return (
    <>
      <div className={styles.analyticsToolbar}>
        <p className={styles.analyticsToolbarHint}>筛选列表展示范围，导出 CSV 包含全部历史</p>
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
              onClick={() => handleRangeChange(days)}
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
              <h2>云端历史明细</h2>
              <p>{rangeHint}已同步的下载记录，含标题、平台、作者与链接。</p>
            </div>
            <button
              type="button"
              className={styles.panelExportBtn}
              disabled={exportBusy || loading}
              onClick={() => void runExport()}
            >
              <Icon name="export" size={13} />
              {exportBusy ? '导出中…' : '下载 CSV'}
            </button>
          </div>
        </header>

        {error ? (
          <p className={styles.errorHint}>
            {error}{' '}
            <button type="button" className={styles.inlineLinkBtn} onClick={() => void reload()}>
              重试
            </button>
          </p>
        ) : null}

        <DataTable
          columns={HISTORY_COLUMNS}
          data={items}
          rowKey={(item) => item.clientId}
          loading={loading}
          pageSize={PAGE_SIZE}
          total={total}
          page={page}
          onPageChange={setPage}
          minWidth={680}
          emptyHint="暂无历史记录。在客户端完成下载并开启云同步后，数据会出现在这里。"
          footer={tableFooter}
        />

        {exportMsg ? <p className={styles.exportMsg}>{exportMsg}</p> : null}
      </section>
    </>
  )
}
