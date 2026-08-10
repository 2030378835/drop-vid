/**
 * @file 骨架屏基础块
 * @description 账户区加载占位，shimmer 动画
 * @author qiangcan
 * @date 2026-08-08
 */

import type { CSSProperties, JSX } from 'react'
import styles from './Skeleton.module.css'

export type SkeletonProps = {
  width?: string | number
  height?: string | number
  circle?: boolean
  className?: string
  style?: CSSProperties
}

/** 单块 shimmer 占位 */
export function Skeleton({
  width = '100%',
  height = 14,
  circle = false,
  className,
  style
}: SkeletonProps): JSX.Element {
  return (
    <span
      className={[styles.bone, circle ? styles.circle : '', className].filter(Boolean).join(' ')}
      style={{
        width,
        height,
        ...style
      }}
      aria-hidden
    />
  )
}
