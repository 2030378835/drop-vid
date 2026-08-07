/**
 * @file Icon 组件
 * @description 基于 iconfont 字体图标的统一封装
 * @author qiangcan
 * @date 2026-07-31
 */

import type { CSSProperties, HTMLAttributes } from 'react'
import { resolveIconfontClass, type IconName } from './icons'
import styles from './Icon.module.css'
import './assets/iconfont.css'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24
}

export type IconProps = {
  /** 语义别名或 iconfont font_class */
  name: IconName
  color?: string
  size?: IconSize | number
  className?: string
} & Pick<HTMLAttributes<HTMLElement>, 'aria-hidden' | 'aria-label' | 'role' | 'title'>

/** 渲染 iconfont 图标；颜色走 currentColor，尺寸用 font-size */
export function Icon({
  name,
  color,
  size,
  className,
  'aria-hidden': ariaHidden = true,
  ...rest
}: IconProps): React.JSX.Element {
  const fontClass = resolveIconfontClass(name)
  const dimension = typeof size === 'number' ? size : size ? SIZE_MAP[size] : undefined

  const style: CSSProperties | undefined =
    color || dimension
      ? {
          ...(color ? { color } : {}),
          ...(dimension
            ? {
                fontSize: dimension,
                width: dimension,
                height: dimension
              }
            : {})
        }
      : undefined

  const classNames = ['iconfont', `icon-${fontClass}`, styles.root, 'dv-icon', className]
    .filter(Boolean)
    .join(' ')

  return (
    <i className={classNames} style={style} aria-hidden={ariaHidden} {...rest} />
  )
}
