/** 与 Vite base 对齐的 React Router basename（去尾斜杠；根路径用 '/'） */
export function routerBasename(): string {
  const base = import.meta.env.BASE_URL || '/'
  const trimmed = base.replace(/\/$/, '')
  return trimmed || '/'
}
