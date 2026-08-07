/**
 * @file 平台 ID 展示名
 * @description 优先服务端字典 name，缺失时用本地映射
 * @author qiangcan
 * @date 2026-08-07
 */

import { getPlatformCatalogEntry } from '../platform/platformCatalog'

const LABELS: Record<string, string> = {
  douyin: '抖音',
  bilibili: 'Bilibili',
  youtube: 'YouTube',
  xiaohongshu: '小红书',
  weixin: '视频号',
  xinpianchang: '新片场',
  instagram: 'Instagram',
  twitter: 'X',
  x: 'X',
  generic: '其他',
  direct: '直链'
}

export function platformLabel(platformId: string): string {
  const key = platformId.trim().toLowerCase()
  const serverName = getPlatformCatalogEntry(key)?.name?.trim()
  if (serverName) return serverName
  return LABELS[key] || platformId || '其他'
}
