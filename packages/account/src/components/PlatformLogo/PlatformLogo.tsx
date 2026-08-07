/**
 * @file 平台 Logo
 * @description 优先服务端 iconUrl，加载失败或缺失时用本地 SVG / 首字占位
 * @author qiangcan
 * @date 2026-08-07
 */

import { useState, type JSX } from 'react'
import { usePlatformCatalog } from '../../platform/PlatformCatalogProvider'
import { getLocalPlatformIcon, getServerPlatformIcon } from '../../utils/platformIcons'
import { platformLabel } from '../../utils/platformLabels'
import styles from './PlatformLogo.module.css'

type PlatformLogoProps = {
  platformId: string
  size?: number
  className?: string
}

export function PlatformLogo({
  platformId,
  size = 18,
  className
}: PlatformLogoProps): JSX.Element {
  // 字典加载完成后重渲染，以便切换到服务端 iconUrl / name
  usePlatformCatalog()

  const label = platformLabel(platformId)
  const [imgFailed, setImgFailed] = useState(false)
  const serverUrl = getServerPlatformIcon(platformId)
  const src = imgFailed ? getLocalPlatformIcon(platformId) : serverUrl ?? getLocalPlatformIcon(platformId)

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={className ? `${styles.logo} ${className}` : styles.logo}
        draggable={false}
        aria-hidden
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <span
      className={className ? `${styles.fallback} ${className}` : styles.fallback}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {label.slice(0, 1)}
    </span>
  )
}
