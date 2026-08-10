/**
 * @file 通用数据表格
 * @description 列配置 + 可选分页，供账户区各列表复用
 * @author qiangcan
 * @date 2026-08-07
 */

import { useEffect, useMemo, useState, type JSX, type ReactNode } from 'react'
import { TableSkeleton } from '../Skeleton'
import styles from './DataTable.module.css'

export type DataTableColumn<T> = {
  key: string
  title: string
  /** 列宽，如 '26%'、'120px' */
  width?: string
  align?: 'left' | 'center' | 'right'
  /** 单元格内容换行（默认单行省略） */
  wrap?: boolean
  render?: (row: T, index: number) => ReactNode
}

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyHint?: string
  /** 每页条数；不传则不分页 */
  pageSize?: number
  /** 服务端分页：总条数（与 page / onPageChange 一起使用） */
  total?: number
  /** 服务端分页：当前页（1 起） */
  page?: number
  /** 服务端分页：翻页回调 */
  onPageChange?: (page: number) => void
  footer?: ReactNode
  /** 表格最小宽度，超出容器时横向滚动 */
  minWidth?: number
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyHint = '暂无数据',
  pageSize,
  total: totalProp,
  page: pageProp,
  onPageChange,
  footer,
  minWidth
}: DataTableProps<T>): JSX.Element {
  const [localPage, setLocalPage] = useState(1)
  const serverPaginated = totalProp != null && pageProp != null && onPageChange != null
  const clientPaginated = !serverPaginated && pageSize != null && pageSize > 0
  const paginated = serverPaginated || clientPaginated

  const page = serverPaginated ? pageProp : localPage
  const totalCount = serverPaginated ? totalProp : data.length
  const totalPages = paginated ? Math.max(1, Math.ceil(totalCount / (pageSize ?? 1))) : 1

  const pageData = useMemo(() => {
    if (serverPaginated || !clientPaginated) return data
    const start = (localPage - 1) * pageSize!
    return data.slice(start, start + pageSize!)
  }, [data, localPage, pageSize, clientPaginated, serverPaginated])

  useEffect(() => {
    if (!serverPaginated) setLocalPage(1)
  }, [data, pageSize, serverPaginated])

  useEffect(() => {
    if (!serverPaginated && localPage > totalPages) setLocalPage(totalPages)
  }, [localPage, totalPages, serverPaginated])

  function goToPage(next: number): void {
    const clamped = Math.min(Math.max(1, next), totalPages)
    if (serverPaginated) {
      onPageChange!(clamped)
    } else {
      setLocalPage(clamped)
    }
  }

  if (loading && data.length === 0) {
    return <TableSkeleton columns={columns.length || 4} rows={pageSize ?? 5} />
  }

  if (pageData.length === 0) {
    return <p className={styles.emptyHint}>{loading ? '加载中…' : emptyHint}</p>
  }

  return (
    <>
      <div className={styles.wrap}>
        <table
          className={[styles.table, minWidth != null ? styles.tableFixed : ''].filter(Boolean).join(' ')}
          style={minWidth != null ? { minWidth } : undefined}
        >
          {columns.some((col) => col.width) ? (
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} style={col.width ? { width: col.width } : undefined} />
              ))}
            </colgroup>
          ) : null}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={
                    col.align === 'right'
                      ? styles.alignRight
                      : col.align === 'center'
                        ? styles.alignCenter
                        : undefined
                  }
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, rowIndex) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => {
                  const content = col.render
                    ? col.render(row, rowIndex)
                    : String((row as Record<string, unknown>)[col.key] ?? '—')
                  const cellClass = [
                    col.wrap ? styles.cellWrap : styles.cellEllipsis,
                    col.align === 'right'
                      ? styles.alignRight
                      : col.align === 'center'
                        ? styles.alignCenter
                        : ''
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <td key={col.key} className={cellClass || undefined}>
                      {content}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginated && totalCount > 0 ? (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            共 {totalCount} 条，第 {page} / {totalPages} 页
          </span>
          <div className={styles.paginationActions}>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={page <= 1 || loading}
              onClick={() => goToPage(page - 1)}
            >
              上一页
            </button>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={page >= totalPages || loading}
              onClick={() => goToPage(page + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      ) : null}

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </>
  )
}
