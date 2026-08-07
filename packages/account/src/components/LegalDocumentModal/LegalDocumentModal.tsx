/**
 * @file 法律文档弹窗
 * @description 展示服务端下发的隐私政策、服务条款等富文本
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { Modal } from '@dropvid/ui'
import styles from './LegalDocumentModal.module.css'

export type LegalDocumentContent = {
  title: string
  lead?: string
  updatedAt?: number
  contentHtml?: string
}

type Props = {
  open: boolean
  loading?: boolean
  error?: string | null
  document: LegalDocumentContent | null
  onClose: () => void
}

/** 格式化「最后更新」 */
function formatLegalUpdatedAt(ms: number): string {
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

/** 法律文档 Modal */
export function LegalDocumentModal({
  open,
  loading = false,
  error = null,
  document,
  onClose
}: Props): JSX.Element {
  const title = document?.title ?? '法律文档'
  const hasContent = Boolean(document?.contentHtml?.trim())
  const updatedLabel = document?.updatedAt
    ? `最后更新：${formatLegalUpdatedAt(document.updatedAt)}`
    : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={loading}
      title={title}
      description={document?.lead}
      size="md"
      scrollBody
      showCloseButton
      bodyClassName={styles.body}
      footerClassName={styles.footer}
      footer={
        <>
          {updatedLabel ? <span className={styles.updatedAt}>{updatedLabel}</span> : <span />}
          <button type="button" className={styles.confirmBtn} onClick={onClose}>
            我知道了
          </button>
        </>
      }
    >
      {loading ? <p className={styles.loading}>加载中…</p> : null}
      {!loading && error ? <p className={styles.error}>{error}</p> : null}
      {!loading && !error && hasContent ? (
        <div
          className={styles.htmlContent}
          dangerouslySetInnerHTML={{ __html: document?.contentHtml ?? '' }}
        />
      ) : null}
      {!loading && !error && !hasContent ? (
        <p className={styles.empty}>暂无正文内容</p>
      ) : null}
    </Modal>
  )
}
