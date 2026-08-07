/** Pro 计费周期 */
export type ProBillingCycle = 'monthly' | 'yearly' | 'lifetime'

/** Tab 选项（月付 / 年付 / 永久） */
export const PRO_BILLING_TABS: Array<{
  id: ProBillingCycle
  label: string
}> = [
  { id: 'monthly', label: '月付' },
  { id: 'yearly', label: '年付' },
  { id: 'lifetime', label: '永久' }
]

/** Pro 各周期售价（人民币） */
export const PRO_BILLING_PRICES: Record<
  ProBillingCycle,
  {
    price: number
    unit: string
    originalPrice?: number
    saveHint?: string
    badge?: string
    footnote: string
  }
> = {
  monthly: {
    price: 19.9,
    unit: '/ 月',
    footnote: '按月续费，可随时在客户端管理订阅。'
  },
  yearly: {
    price: 159,
    unit: '/ 年',
    saveHint: '约合 ¥13.3 / 月',
    footnote: '一次付清一年，比月付更划算。'
  },
  lifetime: {
    price: 199,
    unit: '限时',
    originalPrice: 299,
    badge: '限时',
    footnote: '限时特惠，原价 ¥299；买断后持续享受 Pro。'
  }
}
