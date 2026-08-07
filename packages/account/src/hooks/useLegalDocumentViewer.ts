/**
 * @file 法律文档查看 Hook
 * @description 拉取服务端文档并控制 Modal 展示
 * @author qiangcan
 * @date 2026-08-07
 */

import { useCallback, useMemo, useState } from 'react'
import {
  fetchLegalDocuments,
  type RemoteLegalDocument
} from '../api/legalDocuments'
import type { LegalDocumentContent } from '../components/LegalDocumentModal'

function toViewFromRemote(doc: RemoteLegalDocument): LegalDocumentContent {
  return {
    title: doc.title,
    lead: doc.lead,
    contentHtml: doc.contentHtml,
    updatedAt: doc.updatedAt
  }
}

/** 法律文档拉取与弹窗状态 */
export function useLegalDocumentViewer() {
  const [viewCode, setViewCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remoteDocs, setRemoteDocs] = useState<RemoteLegalDocument[] | null>(null)

  const documentMap = useMemo(() => {
    const map = new Map<string, LegalDocumentContent>()
    remoteDocs?.forEach((doc) => map.set(doc.code, toViewFromRemote(doc)))
    return map
  }, [remoteDocs])

  const activeDocument = viewCode ? (documentMap.get(viewCode) ?? null) : null

  const openLegalDocument = useCallback((code: string): void => {
    setViewCode(code)
    setError(null)

    const cached = remoteDocs?.find((item) => item.code === code)
    if (cached) return

    setLoading(true)
    void fetchLegalDocuments()
      .then((docs) => {
        setRemoteDocs(docs)
        const doc = docs.find((item) => item.code === code)
        if (!doc) {
          setError('文档不存在或暂未配置')
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : '文档加载失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [remoteDocs])

  const closeLegalDocument = useCallback((): void => {
    setViewCode(null)
    setError(null)
  }, [])

  return {
    viewCode,
    loading,
    error,
    activeDocument,
    openLegalDocument,
    closeLegalDocument
  }
}
