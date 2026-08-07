/**
 * @file 账户 API 客户端
 * @description 官网 web 平台鉴权请求封装
 * @author qiangcan
 * @date 2026-08-07
 */

import { resolveApiBaseUrl } from '@dropvid/shared'

type ApiFail = { ok: false; message: string; code?: string }

function deviceHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-DropVid-Platform': 'web'
  }
}

/** 带 Bearer 的账户 API 请求 */
export async function accountFetch<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    token?: string
    sessionId?: string
  } = {}
): Promise<T> {
  const base = resolveApiBaseUrl().replace(/\/$/, '')
  const headers: Record<string, string> = {
    ...(deviceHeaders() as Record<string, string>)
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`
  if (options.sessionId) headers['X-DropVid-Session-Id'] = options.sessionId

  const res = await fetch(`${base}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  })

  const data = (await res.json()) as T | ApiFail
  if (!res.ok || (data as ApiFail).ok === false) {
    const fail = data as ApiFail
    throw new Error(fail.message || `请求失败（${res.status}）`)
  }
  return data as T
}
