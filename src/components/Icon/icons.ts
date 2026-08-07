/**
 * @file Icon 名称映射
 * @description 业务语义名 → iconfont font_class；也可直接传 font_class
 * @author qiangcan
 * @date 2026-07-31
 */

import iconfontMeta from './assets/iconfont.json'

type IconfontMeta = {
  glyphs: Array<{ font_class: string }>
}

/** iconfont 工程里登记的 font_class 集合（运行时校验） */
const ICONFONT_CLASS_SET = new Set(
  (iconfontMeta as IconfontMeta).glyphs.map((g) => g.font_class)
)

/**
 * 业务侧沿用的语义图标名 → iconfont 的 font_class。
 * 新增图标优先在此登记，调用处继续用短名。
 */
export const ICON_ALIAS = {
  home: 'home',
  history: 'history',
  settings: 'settings',
  about: 'info',
  warning: 'warning',
  error: 'error',
  info: 'info',
  play: 'play',
  check: 'checkmark',
  checkBold: 'checkmark',
  chevronDown: 'chevron-down',
  /** 侧栏收起 */
  panelCollapse: 'toggle-left',
  /** 侧栏展开 */
  panelExpand: 'toggle-right',
  download: 'download',
  copy: 'copy',
  /** 粘贴 */
  paste: 'contentpaste',
  link: 'link',
  folderOpen: 'folderopen',
  trash: 'trash',
  star: 'staroutline',
  starFilled: 'star',
  tag: 'pricetags',
  /** 仅云端清单（无本地文件） */
  cloudQueue: 'cloudqueue',
  cloud: 'cloud',
  /** 跨设备同步 */
  sync: 'sync',
  /** 自动备份 */
  backup: 'backup',
  /** 数据看板 */
  dashboard: 'dashboard',
  video: 'videocam',
  shield: 'shield',
  lock: 'lock',
  notification: 'notification',
  user: 'user',
  person: 'person',
  /** 已登录用户 */
  personDone: 'person-done',
  /** 托盘 / 移动端示意 */
  devices: 'smartphone',
  monitor: 'monitor',
  /** macOS */
  mac: 'laptopmac',
  /** Windows / PC */
  windows: 'laptopchromebook',
  security: 'security',
  /** 会员 / Pro（与 person 同系线标） */
  pro: 'star',
  award: 'award',
  tip: 'dengpao',
  circlePlus: 'circleplus'
} as const

export type IconAliasName = keyof typeof ICON_ALIAS

/** 语义别名，或 iconfont.json 中的任意 font_class */
export type IconName = IconAliasName | (string & {})

/** 将 name 解析为 iconfont 的 font_class */
export function resolveIconfontClass(name: IconName): string {
  if (Object.prototype.hasOwnProperty.call(ICON_ALIAS, name)) {
    return ICON_ALIAS[name as IconAliasName]
  }
  if (ICONFONT_CLASS_SET.has(name)) {
    return name
  }
  if (import.meta.env.DEV) {
    console.warn(`[Icon] unknown icon name: ${name}`)
  }
  return name
}

/** @deprecated 兼容旧导出 */
export type IconDefinition = { fontClass: string }

/** @deprecated 兼容旧导出；请使用 ICON_ALIAS */
export const ICONS = ICON_ALIAS
