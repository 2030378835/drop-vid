/**
 * @file 账户子页面路由
 * @author qiangcan
 * @date 2026-08-07
 */

export type AccountPageId = 'overview' | 'usage' | 'history' | 'devices' | 'settings'

export const ACCOUNT_PAGE_IDS: AccountPageId[] = [
  'overview',
  'usage',
  'history',
  'devices',
  'settings'
]

export const ACCOUNT_PAGE_LABELS: Record<AccountPageId, string> = {
  overview: '概览',
  usage: '用量',
  history: '云端历史',
  devices: '登录设备',
  settings: '账户设置'
}

/** 账户区嵌套路由 path（相对 /account） */
export function accountPagePath(id: AccountPageId): string {
  return `/account/${id}`
}

export function accountPageIdFromPath(pathname: string): AccountPageId | null {
  const match = pathname.match(/\/account\/([^/]+)/)
  const segment = match?.[1]
  if (segment && ACCOUNT_PAGE_IDS.includes(segment as AccountPageId)) {
    return segment as AccountPageId
  }
  return null
}

export type AccountNavItem = {
  id: AccountPageId
  label: string
  icon: string
}

export type AccountNavGroup = {
  title?: string
  items: AccountNavItem[]
}

export const ACCOUNT_NAV_GROUPS: AccountNavGroup[] = [
  {
    items: [{ id: 'overview', label: '概览', icon: 'chart-pie' }]
  },
  {
    title: '账户',
    items: [
      { id: 'usage', label: '用量', icon: 'trending-up' },
      { id: 'history', label: '云端历史', icon: 'history' }
    ]
  },
  {
    title: '安全',
    items: [
      { id: 'devices', label: '登录设备', icon: 'laptopmac' },
      { id: 'settings', label: '账户设置', icon: 'setting' }
    ]
  }
]

/** 登录成功后默认进入的页面 */
export const ACCOUNT_HOME_PATH = accountPagePath('overview')
