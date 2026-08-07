/**
 * 下载按钮配置与工具函数。
 * 运行时优先从 Gitee latest.json 拉取；失败时使用下方兜底版本。
 */
import type { UpdateManifest } from '@dropvid/shared'

/** 拉取失败时的兜底版本（与 push-drop-vid 保持大致同步） */
export const FALLBACK_VERSION = '0.1.4'

export type DownloadArch = 'arm64' | 'x64'

export type DownloadItem = {
  arch: DownloadArch
  label: string
  detail: string
  href: string
  primary?: boolean
}

export type WinDownloadItem = {
  label: string
  detail: string
  href: string
}

export type SiteDownloads = {
  version: string
  notes?: string
  macDownloads: DownloadItem[]
  winDownload: WinDownloadItem
}

const MAC_SPECS: Array<{
  arch: DownloadArch
  platformKey: 'darwin-arm64' | 'darwin-x64'
  label: string
  detail: string
  primary?: boolean
}> = [
  {
    arch: 'arm64',
    platformKey: 'darwin-arm64',
    label: 'Apple Silicon',
    detail: 'Apple Silicon · arm64',
    primary: true
  },
  {
    arch: 'x64',
    platformKey: 'darwin-x64',
    label: 'Intel',
    detail: 'Intel · x64'
  }
]

function normalizeVersion(raw?: string): string {
  return (raw ?? FALLBACK_VERSION).trim().replace(/^v/i, '')
}

function buildHref(version: string, arch: DownloadArch): string {
  return `https://github.com/2030378835/drop-vid/releases/download/v${version}/DropVid-${version}-${arch}.dmg`
}

function buildWinHref(version: string): string {
  return `https://github.com/2030378835/drop-vid/releases/download/v${version}/DropVid-${version}-setup.exe`
}

/** 本地兜底下载配置（Gitee 不可用时） */
export function buildFallbackDownloads(): SiteDownloads {
  const version = FALLBACK_VERSION
  return {
    version,
    macDownloads: MAC_SPECS.map((spec) => ({
      arch: spec.arch,
      label: spec.label,
      detail: spec.detail,
      href: buildHref(version, spec.arch),
      primary: spec.primary
    })),
    winDownload: {
      label: 'Windows',
      detail: 'Windows 10 / 11 · 64 位',
      href: buildWinHref(version)
    }
  }
}

/** 将 Gitee latest.json 转为官网下载结构 */
export function downloadsFromManifest(manifest: UpdateManifest): SiteDownloads {
  const version = normalizeVersion(manifest.version)
  const downloads = manifest.downloads ?? {}

  const macDownloads = MAC_SPECS.map((spec) => ({
    arch: spec.arch,
    label: spec.label,
    detail: spec.detail,
    href: downloads[spec.platformKey]?.trim() || buildHref(version, spec.arch),
    primary: spec.primary
  }))

  const winDownload: WinDownloadItem = {
    label: 'Windows',
    detail: 'Windows 10 / 11 · 64 位',
    href: downloads['win32-x64']?.trim() || buildWinHref(version)
  }

  return {
    version,
    notes: manifest.notes?.trim(),
    macDownloads,
    winDownload
  }
}

export function isDownloadReady(href: string): boolean {
  const value = href.trim()
  return value.length > 0 && value !== '#'
}

export function hasAnyDownload(downloads: SiteDownloads): boolean {
  return (
    downloads.macDownloads.some((item) => isDownloadReady(item.href)) ||
    isDownloadReady(downloads.winDownload.href)
  )
}

export function getDownloadByArch(
  macDownloads: DownloadItem[],
  arch: DownloadArch
): DownloadItem | undefined {
  return macDownloads.find((item) => item.arch === arch)
}

/** 触发安装包下载 */
export function startDownload(href: string): void {
  if (!isDownloadReady(href)) return
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.rel = 'noopener noreferrer'
  const fileName = href.split('/').pop()
  if (fileName && /\.(dmg|zip|pkg|exe)(\?|$)/i.test(fileName)) {
    anchor.setAttribute('download', fileName.split('?')[0] ?? fileName)
  }
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}
