/**
 * @file 登录设备页
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { DeviceListSkeleton } from '../../components/Skeleton'
import { formatDateTime } from '../../utils/format'
import styles from '../../layout/AccountLayout.module.css'

function isWebSession(label?: string): boolean {
  return (label ?? '').includes('官网')
}

export function DevicesPage(): JSX.Element {
  const { me, loading } = useAuth()
  const sessions = me?.sessions ?? []
  const desktopCount = sessions.filter((item) => !isWebSession(item.deviceLabel)).length

  return (
    <section className={styles.panel}>
      <header className={styles.panelHead}>
        <h2>登录设备</h2>
        <p>桌面客户端占用设备名额（当前 {desktopCount} 台）；官网浏览器登录不计入上限。</p>
      </header>

      {loading && sessions.length === 0 ? (
        <DeviceListSkeleton rows={3} />
      ) : sessions.length === 0 ? (
        <p className={styles.emptyHint}>暂无设备记录</p>
      ) : (
        <ul className={styles.deviceList}>
          {sessions.map((item) => (
            <li key={item.id} className={styles.deviceRow}>
              <div className={styles.deviceMain}>
                <strong>
                  {item.deviceLabel || '未知设备'}
                  {item.isCurrent ? <em>当前</em> : null}
                </strong>
                <span>
                  {[item.locationLabel, item.lastSeenAt ? formatDateTime(item.lastSeenAt) : null]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </span>
              </div>
              <span className={styles.deviceTag}>
                {isWebSession(item.deviceLabel) ? '浏览器' : '客户端'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
