import type { DownloadArch } from '../config/downloads'

type UAData = {
  getHighEntropyValues: (hints: string[]) => Promise<{ architecture?: string }>
}

/**
 * 探测本机 mac 架构，供下载默认选项。
 * Apple Silicon 在多数浏览器里仍报 MacIntel，优先用 Client Hints。
 */
export async function detectMacArch(): Promise<DownloadArch> {
  try {
    const uaData = (navigator as Navigator & { userAgentData?: UAData }).userAgentData
    if (uaData?.getHighEntropyValues) {
      const { architecture } = await uaData.getHighEntropyValues(['architecture'])
      const value = (architecture ?? '').toLowerCase()
      if (value.includes('arm')) return 'arm64'
      if (value.includes('x86') || value.includes('x64')) return 'x64'
    }
  } catch {
    // ignore
  }

  const ua = navigator.userAgent
  if (/arm64|aarch64|apple\s*silicon/i.test(ua)) return 'arm64'

  // 2020 年后 Mac 以 Apple Silicon 为主；无法识别时默认 arm64
  return 'arm64'
}
