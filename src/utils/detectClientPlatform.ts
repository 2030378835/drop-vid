export type ClientPlatform = 'mac' | 'windows' | 'other'

/** 根据 UA / platform 判断当前访问设备，用于首页下载区适配 */
export function detectClientPlatform(): ClientPlatform {
  const ua = navigator.userAgent
  const platform = navigator.platform

  if (/Win/i.test(platform) || /Windows/i.test(ua)) {
    return 'windows'
  }

  if (/Mac/i.test(platform) || /Macintosh|Mac OS/i.test(ua)) {
    return 'mac'
  }

  return 'other'
}
