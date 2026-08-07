/**
 * @file Modal 弹窗
 * @description 通用二次确认 / 表单弹层，挂载到 document.body
 * @author qiangcan
 * @date 2026-08-07
 */

import { useEffect, useId, type HTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import styles from './Modal.module.css'

export type ModalSize = 'sm' | 'md' | 'lg'

export type ModalProps = {
  /** 是否显示 */
  open: boolean
  /** 关闭回调（遮罩 / Esc / 关闭按钮） */
  onClose: () => void
  /** 标题 */
  title?: ReactNode
  titleId?: string
  /** 标题下方说明 */
  description?: ReactNode
  /** 是否显示右上角关闭按钮 */
  showCloseButton?: boolean
  /** 底部操作区 */
  footer?: ReactNode
  children?: ReactNode
  size?: ModalSize
  /** 交互进行中时禁止关闭 */
  busy?: boolean
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  scrollBody?: boolean
  className?: string
  panelClassName?: string
  bodyClassName?: string
  footerClassName?: string
} & Pick<HTMLAttributes<HTMLDivElement>, 'aria-describedby'>

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: '',
  md: styles.panelMd,
  lg: styles.panelLg
}

/** 通用 Modal：Portal 到 body，支持 Esc / 遮罩关闭 */
export function Modal({
  open,
  onClose,
  title,
  titleId: titleIdProp,
  description,
  showCloseButton = false,
  footer,
  children,
  size = 'sm',
  busy = false,
  closeOnOverlay = true,
  closeOnEscape = true,
  scrollBody = false,
  className,
  panelClassName,
  bodyClassName,
  footerClassName,
  'aria-describedby': ariaDescribedBy
}: ModalProps): React.JSX.Element | null {
  const generatedTitleId = useId()
  const titleId = titleIdProp ?? generatedTitleId
  const hasHeader = Boolean(title || description)

  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open || !closeOnEscape) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !busy) onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [busy, closeOnEscape, onClose, open])

  if (!open) return null

  const panelClass = [styles.panel, SIZE_CLASS[size], panelClassName].filter(Boolean).join(' ')
  const bodyClass = [styles.body, scrollBody ? styles.bodyScroll : '', bodyClassName]
    .filter(Boolean)
    .join(' ')
  const footerClass = [
    styles.footer,
    !children && !scrollBody ? styles.footerFlushTop : '',
    footerClassName
  ]
    .filter(Boolean)
    .join(' ')

  return createPortal(
    <div
      className={[styles.overlay, className].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={ariaDescribedBy}
      onClick={() => {
        if (!busy && closeOnOverlay) onClose()
      }}
    >
      <div className={panelClass} onClick={(event) => event.stopPropagation()}>
        {showCloseButton ? (
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="关闭"
            disabled={busy}
            onClick={onClose}
          >
            <Icon name="close" size={16} aria-hidden />
          </button>
        ) : null}

        {hasHeader ? (
          <div className={styles.header}>
            {title ? (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            ) : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
        ) : null}

        {children ? <div className={bodyClass}>{children}</div> : null}
        {footer ? <div className={footerClass}>{footer}</div> : null}
      </div>
    </div>,
    document.body
  )
}
