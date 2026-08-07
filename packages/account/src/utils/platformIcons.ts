/**
 * @file 平台图标
 * @description 优先服务端 iconUrl，缺失时用本地 SVG 兜底
 * @author qiangcan
 * @date 2026-08-07
 */

import { getPlatformCatalogEntry } from '../platform/platformCatalog'
import bilibiliIcon from '../assets/platforms/bilibili.svg'
import douyinIcon from '../assets/platforms/douyin.svg'
import instagramIcon from '../assets/platforms/instagram.svg'
import linkIcon from '../assets/platforms/link.svg'
import weixinIcon from '../assets/platforms/weixin.svg'
import xIcon from '../assets/platforms/x.svg'
import xiaohongshuIcon from '../assets/platforms/xiaohongshu.svg'
import xinpianchangIcon from '../assets/platforms/xinpianchang.svg'
import youtubeIcon from '../assets/platforms/youtube.svg'

const LOCAL_ICONS: Record<string, string> = {
  douyin: douyinIcon,
  weixin: weixinIcon,
  xiaohongshu: xiaohongshuIcon,
  xinpianchang: xinpianchangIcon,
  bilibili: bilibiliIcon,
  youtube: youtubeIcon,
  twitter: xIcon,
  x: xIcon,
  instagram: instagramIcon,
  generic: linkIcon,
  direct: linkIcon
}

/** 本地 SVG 兜底（不含服务端 URL） */
export function getLocalPlatformIcon(platformId: string): string | undefined {
  const key = platformId.trim().toLowerCase()
  return LOCAL_ICONS[key]
}

/** 服务端 iconUrl */
export function getServerPlatformIcon(platformId: string): string | undefined {
  const key = platformId.trim().toLowerCase()
  return getPlatformCatalogEntry(key)?.iconUrl?.trim() || undefined
}

/** 获取平台 Logo 地址；优先服务端 iconUrl，否则本地 SVG */
export function getPlatformIcon(platformId: string): string | undefined {
  return getServerPlatformIcon(platformId) ?? getLocalPlatformIcon(platformId)
}
