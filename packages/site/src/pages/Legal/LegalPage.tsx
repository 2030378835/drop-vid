/**
 * @file 法律条款页
 * @description 服务条款与隐私政策 Tab 切换，支持 #terms / #privacy 锚点
 * @author qiangcan
 * @date 2026-08-08
 */

import { fetchLegalDocuments, LEGAL_DOCUMENT_CODES, type RemoteLegalDocument } from '@dropvid/account'
import { useEffect, useMemo, useState, type JSX } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SiteFooter } from '../../components/SiteFooter/SiteFooter'
import { SiteHeader } from '../../components/SiteHeader'
import styles from './LegalPage.module.css'

type LegalTab = 'terms' | 'privacy'

const TAB_META: Record<LegalTab, { label: string; hash: string; fallbackTitle: string }> = {
  terms: { label: '服务条款', hash: 'terms', fallbackTitle: '服务条款' },
  privacy: { label: '隐私政策', hash: 'privacy', fallbackTitle: '隐私政策' }
}

/** 从 location.hash 解析当前 Tab */
function parseLegalTab(hash: string): LegalTab {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  return id === 'privacy' ? 'privacy' : 'terms'
}

/** 格式化「最后更新」 */
function formatUpdatedAt(ms: number): string {
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

type LegalPanelProps = {
  document: RemoteLegalDocument | undefined
  loading: boolean
  fallbackTitle: string
}

/** 当前 Tab 对应的法律文档内容 */
function LegalPanel({ document, loading, fallbackTitle }: LegalPanelProps): JSX.Element {
  const hasContent = Boolean(document?.contentHtml?.trim())

  return (
    <article className={styles.panel}>
      <header className={styles.panelHead}>
        <h2>{document?.title ?? fallbackTitle}</h2>
        {document?.lead ? <p>{document.lead}</p> : null}
        {document?.updatedAt ? (
          <span className={styles.updatedAt}>最后更新：{formatUpdatedAt(document.updatedAt)}</span>
        ) : null}
      </header>

      {loading && !document ? <p className={styles.loading}>加载中…</p> : null}
      {!loading && hasContent ? (
        <div
          className={styles.htmlContent}
          dangerouslySetInnerHTML={{ __html: document?.contentHtml ?? '' }}
        />
      ) : null}
      {!loading && !hasContent ? <p className={styles.empty}>暂无正文内容</p> : null}
    </article>
  )
}

/** 服务条款 / 隐私政策 Tab 页 */
export function LegalPage(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = useMemo(() => parseLegalTab(location.hash), [location.hash])

  const [documents, setDocuments] = useState<RemoteLegalDocument[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeMeta = TAB_META[activeTab]
  const activeDocument =
    activeTab === 'terms'
      ? documents?.find((doc) => doc.code === LEGAL_DOCUMENT_CODES.terms)
      : documents?.find((doc) => doc.code === LEGAL_DOCUMENT_CODES.privacy)

  useEffect(() => {
    const previous = document.title
    document.title = `${activeMeta.label} · DropVid`
    window.scrollTo(0, 0)

    return () => {
      document.title = previous
    }
  }, [activeMeta.label])

  useEffect(() => {
    void fetchLegalDocuments()
      .then((docs) => setDocuments(docs))
      .catch((e) => setError(e instanceof Error ? e.message : '文档加载失败'))
      .finally(() => setLoading(false))
  }, [])

  /** 切换 Tab 并同步 URL hash */
  const switchTab = (tab: LegalTab): void => {
    if (tab === activeTab) return
    navigate({ pathname: '/legal', hash: TAB_META[tab].hash }, { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <div className={styles.atmosphere} aria-hidden />
        <SiteHeader variant="onHero" tone="mono" />
        <div className={styles.bannerInner}>
          <p className={styles.kicker}>Legal</p>
          <h1 className={styles.title}>{activeMeta.label}</h1>
          <p className={styles.lead}>请仔细阅读以下内容。使用 DropVid 即表示你理解并同意相关条款。</p>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.tabs} role="tablist" aria-label="法律文档">
          {(Object.keys(TAB_META) as LegalTab[]).map((tab) => {
            const meta = TAB_META[tab]
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`legal-tab-${tab}`}
                aria-selected={isActive}
                aria-controls={`legal-panel-${tab}`}
                className={[styles.tab, isActive ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => switchTab(tab)}
              >
                {meta.label}
              </button>
            )
          })}
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div
          role="tabpanel"
          id={`legal-panel-${activeTab}`}
          aria-labelledby={`legal-tab-${activeTab}`}
        >
          <LegalPanel
            document={activeDocument}
            loading={loading}
            fallbackTitle={activeMeta.fallbackTitle}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
