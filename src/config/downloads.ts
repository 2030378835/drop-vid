/**
 * 官网下载链接配置 —— 发版时只改这一处。
 * href 留空或 '#' 时，对应按钮不可用（页面会提示待发布）。
 */
export type DownloadArch = 'arm64' | 'x64'

export type DownloadItem = {
  /** 架构标识 */
  arch: DownloadArch
  /** 按钮主标题 */
  label: string
  /** 副标题说明 */
  detail: string
  /** 安装包直链（dmg / zip / GitHub Release 均可） */
  href: string
  /** 是否为主推按钮（Apple Silicon） */
  primary?: boolean
}

export const APP_VERSION = '0.1.0'

/** macOS 安装包下载列表（对应 GitHub Release v0.1.0） */
export const MAC_DOWNLOADS: DownloadItem[] = [
  {
    arch: 'arm64',
    label: 'Apple Silicon',
    detail: 'M1 / M2 / M3 / M4 · arm64',
    href: 'https://github.com/2030378835/drop-vid/releases/download/v0.1.0/DropVid-0.1.0-arm64.dmg',
    primary: true
  },
  {
    arch: 'x64',
    label: 'Intel',
    detail: 'x64 · 适用于 Intel Mac',
    href: 'https://github.com/2030378835/drop-vid/releases/download/v0.1.0/DropVid-0.1.0-x64.dmg'
  }
]

export function isDownloadReady(href: string): boolean {
  const value = href.trim()
  return value.length > 0 && value !== '#'
}

export function hasAnyDownload(): boolean {
  return MAC_DOWNLOADS.some((item) => isDownloadReady(item.href))
}

export function getDownloadByArch(arch: DownloadArch): DownloadItem | undefined {
  return MAC_DOWNLOADS.find((item) => item.arch === arch)
}

/** 触发安装包下载（跨域直链用跳转/新开，同域可走 download） */
export function startDownload(href: string): void {
  if (!isDownloadReady(href)) return
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.rel = 'noopener noreferrer'
  // 外链一般由浏览器/CDN 处理 Content-Disposition；保留 download 有助于同域文件名
  const fileName = href.split('/').pop()
  if (fileName && /\.(dmg|zip|pkg)(\?|$)/i.test(fileName)) {
    anchor.setAttribute('download', fileName.split('?')[0] ?? fileName)
  }
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}
