/**
 * @file 平台字典兜底
 * @description API / 同域配置均不可用时的平台列表
 * @author qiangcan
 * @date 2026-08-07
 */

import type { PublicPlatformItem } from '@dropvid/shared'

/** 与官网 fallback 对齐，保证离线或未部署 config 时仍有展示名 */
export const FALLBACK_PLATFORMS: PublicPlatformItem[] = [
  { name: '抖音', code: 'douyin', helpKind: 'supported', note: '分享短链 / 视频页' },
  { name: '微信视频号', code: 'weixin', helpKind: 'needsCookie', note: '需登录 Cookie' },
  { name: '小红书', code: 'xiaohongshu', helpKind: 'needsCookie', note: '需登录 Cookie' },
  { name: '新片场', code: 'xinpianchang', helpKind: 'needsCookie', note: '需登录 Cookie' },
  { name: 'B站', code: 'bilibili', helpKind: 'supported', note: '推荐导入 Cookie' },
  { name: 'YouTube', code: 'youtube', helpKind: 'supported', note: '公开视频' },
  { name: 'Twitter / X', code: 'twitter', helpKind: 'supported', note: '推文中的视频' },
  { name: 'Instagram', code: 'instagram', helpKind: 'needsCookie', note: '需登录 Cookie' }
]
