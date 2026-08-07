import type { PublicPlatformItem } from '@dropvid/shared'
import bilibiliIcon from '../components/Platforms/logos/bilibili.svg'
import douyinIcon from '../components/Platforms/logos/douyin.svg'
import youtubeIcon from '../components/Platforms/logos/youtube.svg'
import xIcon from '../components/Platforms/logos/x.svg'
import instagramIcon from '../components/Platforms/logos/instagram.svg'
import redbookIcon from '../components/Platforms/logos/xiaohongshu.svg'
import xinpianchangIcon from '../components/Platforms/logos/xinpianchang.svg'
import wechatVideoIcon from '../components/Platforms/logos/weixin.svg'

/** 本地品牌图标（服务端 iconUrl 失败或缺失时使用） */
const LOCAL_ICONS: Record<string, string> = {
  douyin: douyinIcon,
  weixin: wechatVideoIcon,
  xiaohongshu: redbookIcon,
  xinpianchang: xinpianchangIcon,
  bilibili: bilibiliIcon,
  youtube: youtubeIcon,
  twitter: xIcon,
  x: xIcon,
  instagram: instagramIcon
}

/** 官网不展示的平台 code（非品牌来源） */
const HIDDEN_CODES = new Set(['generic', 'direct'])

/** 清理服务端模板占位（如 {browser}） */
export function cleanPlatformText(text: string): string {
  return text
    .replace(/\{browser\}/gi, '浏览器')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 官网列表副文案：note → summary 短句 → helpKind 默认 */
export function platformNote(item: PublicPlatformItem): string {
  const note = item.note?.trim()
  if (note) return cleanPlatformText(note)

  const summary = item.helpContent?.summary?.trim()
  if (summary) {
    const short = cleanPlatformText(summary).split(/[。；;]/)[0] ?? ''
    if (short && short.length <= 28) return short
  }

  if (item.helpKind === 'needsCookie') return '需登录 Cookie'
  if (item.helpKind === 'unsupported') return '暂不支持'
  return '公开视频'
}

export function localPlatformIcon(code: string): string | undefined {
  return LOCAL_ICONS[code]
}

/** 过滤出适合官网展示的覆盖平台 */
export function filterMarketingPlatforms(
  items: PublicPlatformItem[]
): PublicPlatformItem[] {
  return items.filter((item) => {
    if (HIDDEN_CODES.has(item.code)) return false
    if (item.helpKind === 'unsupported') return false
    return true
  })
}
