/**
 * @file 平台字典缓存
 * @description 供 PlatformLogo、platformLabel 等同步读取服务端配置
 * @author qiangcan
 * @date 2026-08-07
 */

import type { PublicPlatformItem } from '@dropvid/shared'

let catalogByCode: Map<string, PublicPlatformItem> | null = null

/** 写入平台字典（Provider 加载后调用） */
export function setPlatformCatalog(items: PublicPlatformItem[]): void {
  catalogByCode = new Map(
    items.map((item) => [item.code.trim().toLowerCase(), item])
  )
}

/** 按 code 查平台项；未加载时返回 undefined */
export function getPlatformCatalogEntry(code: string): PublicPlatformItem | undefined {
  const key = code.trim().toLowerCase()
  return catalogByCode?.get(key)
}
