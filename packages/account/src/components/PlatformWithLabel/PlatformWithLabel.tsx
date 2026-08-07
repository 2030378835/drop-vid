/**
 * @file 平台展示（Logo + 名称）
 * @description 订阅平台字典，加载完成后同步更新图标与展示名
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { usePlatformCatalog } from '../../platform/PlatformCatalogProvider'
import { platformLabel } from '../../utils/platformLabels'
import { PlatformLogo } from '../PlatformLogo'
import layoutStyles from '../../layout/AccountLayout.module.css'

type PlatformWithLabelProps = {
  platformId: string
  size?: number
  className?: string
}

export function PlatformWithLabel({
  platformId,
  size = 18,
  className
}: PlatformWithLabelProps): JSX.Element {
  usePlatformCatalog()

  return (
    <div className={className ?? layoutStyles.tablePlatform}>
      <PlatformLogo platformId={platformId} size={size} />
      <span>{platformLabel(platformId)}</span>
    </div>
  )
}
