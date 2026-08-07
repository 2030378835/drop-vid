/**
 * @file 法律文档 API
 * @description 对齐服务端 GET /api/v1/config/legal/documents
 * @author qiangcan
 * @date 2026-08-07
 */

import { accountFetch } from './client'

/** 服务端下发的富文本文档 */
export type RemoteLegalDocument = {
  code: string
  title: string
  lead?: string
  contentHtml: string
  updatedAt: number
  sortOrder?: number
}

/** 内置文档 code */
export const LEGAL_DOCUMENT_CODES = {
  privacy: 'privacy',
  terms: 'terms',
  permissions: 'permissions'
} as const

export type LegalDocumentCode =
  (typeof LEGAL_DOCUMENT_CODES)[keyof typeof LEGAL_DOCUMENT_CODES]

/** 拉取全部公开法律文档 */
export async function fetchLegalDocuments(): Promise<RemoteLegalDocument[]> {
  const data = await accountFetch<{ ok: true; documents: RemoteLegalDocument[] }>(
    '/api/v1/config/legal/documents'
  )
  return data.documents
}
