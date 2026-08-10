/**
 * @file 内置浏览器检测
 * @description 识别 QQ/微信等 App 内置 WebView，便于登录页引导用户用系统浏览器
 * @author qiangcan
 * @date 2026-08-10
 */

/** 是否运行在常见 App 内置浏览器（与系统 Safari/Chrome 存储隔离） */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return (
    /QQ\//i.test(ua) ||
    /MicroMessenger/i.test(ua) ||
    /MailMaster/i.test(ua) ||
    /Weibo/i.test(ua) ||
    /DingTalk/i.test(ua)
  )
}

/** 复制当前页 URL（供 QQ 邮箱用户粘贴到系统浏览器） */
export async function copyCurrentPageUrl(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.location.href) return false
  const url = window.location.href
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      return true
    }
  } catch {
    // fallback
  }
  try {
    const input = document.createElement('textarea')
    input.value = url
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(input)
    return ok
  } catch {
    return false
  }
}
