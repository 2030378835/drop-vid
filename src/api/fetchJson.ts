const FETCH_TIMEOUT_MS = 12_000

/** 带超时的 JSON 拉取；失败返回 null */
export async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store'
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}
