import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchLimits } from '../../api/fetchLimits'
import {
  PRO_BILLING_PRICES,
  PRO_BILLING_TABS,
  type ProBillingCycle
} from '../../config/pricing'
import { DEFAULT_LIMITS, type CloudLimitsConfig } from '@dropvid/shared'
import {
  formatDurationCapHint,
  formatQuotaMain,
  isUnlimitedLimit
} from '@dropvid/shared'
import { Icon, type IconName } from '@dropvid/ui'
import section from '../Section/Section.module.css'
import styles from './Pricing.module.css'

/** 定价页无下载区块时，跳回首页下载区 */
const DOWNLOAD_LINK = { pathname: '/', hash: 'download' } as const

type PlanFeature = {
  text: string
  emphasis?: boolean
}

type PlanCard = {
  id: string
  name: string
  tagline: string
  priceMain: string
  priceUnit: string
  originalPrice?: string
  saveHint?: string
  badge?: string
  featured?: boolean
  icon: IconName
  ctaLabel: string
  features: PlanFeature[]
  footnote: string
}

function formatYuan(value: number): string {
  if (value === 0) return '¥0'
  return Number.isInteger(value) ? `¥${value}` : `¥${value.toFixed(1)}`
}

function buildGuestFeatures(limits: CloudLimitsConfig): PlanFeature[] {
  const guestCap = formatDurationCapHint(limits.guest.durationBuckets) ?? '短视频'
  const guestConcurrent = limits.guest.maxConcurrentDownloads ?? 1

  return [
    { text: `每日 ${formatQuotaMain(limits.guest.dailyDownload)} 本机下载` },
    { text: `单条时长 ${guestCap}` },
    { text: '多平台粘贴解析' },
    { text: '高清本地保存' },
    { text: '无需登录即可试用' },
    {
      text:
        guestConcurrent <= 1
          ? '最多 1 条同时下载'
          : `最多 ${guestConcurrent} 条同时下载`
    }
  ]
}

function buildFreeFeatures(limits: CloudLimitsConfig): PlanFeature[] {
  const freeCap = formatDurationCapHint(limits.free.durationBuckets) ?? '中等时长'
  const freeConcurrent = limits.free.maxConcurrentDownloads ?? 1
  const freeMaxDevices = limits.free.maxDevices ?? 1
  const freeCloud = isUnlimitedLimit(limits.free.cloudHistory)
    ? '云历史不限'
    : `云历史 ${limits.free.cloudHistory ?? 0} 条`

  return [
    { text: '包含游客全部能力', emphasis: true },
    { text: `每日 ${formatQuotaMain(limits.free.dailyDownload)} 下载配额` },
    { text: `单条时长放宽至 ${freeCap}` },
    { text: freeCloud },
    { text: '跨设备同步下载清单' },
    {
      text:
        freeMaxDevices <= 1
          ? '最多 1 个设备登录'
          : `最多 ${freeMaxDevices} 个设备登录`
    },
    {
      text:
        freeConcurrent <= 1
          ? '最多 1 条同时下载'
          : `最多 ${freeConcurrent} 条同时下载`
    }
  ]
}

function buildProFeatures(limits: CloudLimitsConfig): PlanFeature[] {
  const proConcurrent = limits.pro.maxConcurrentDownloads ?? 3
  const proMaxDevices = limits.pro.maxDevices ?? 3
  const proCloud = isUnlimitedLimit(limits.pro.cloudHistory)
    ? '云历史不限'
    : `云历史 ${limits.pro.cloudHistory ?? 0} 条`

  return [
    { text: '包含免费版全部能力', emphasis: true },
    { text: '每日下载次数不限' },
    { text: '单条视频时长不限' },
    { text: proCloud },
    { text: `最多 ${proMaxDevices} 个设备登录` },
    { text: `最多 ${proConcurrent} 条同时下载` },
    { text: '优先体验新平台支持' }
  ]
}

function buildPlans(
  limits: CloudLimitsConfig,
  cycle: ProBillingCycle
): PlanCard[] {
  const billing = PRO_BILLING_PRICES[cycle]

  return [
    {
      id: 'guest',
      name: '游客',
      tagline: '快速试用，粘贴即可下载',
      priceMain: '¥0',
      priceUnit: '无需登录',
      icon: 'person',
      ctaLabel: '免费试用',
      features: buildGuestFeatures(limits),
      footnote: '配额记在本机，登录后可升级云同步。'
    },
    {
      id: 'free',
      name: '免费版',
      tagline: '登录同步，适合日常下载',
      priceMain: '¥0',
      priceUnit: '登录即用',
      icon: 'personDone',
      ctaLabel: '下载并登录',
      features: buildFreeFeatures(limits),
      footnote: '免费可用；无限次数与长视频请升级 Pro。'
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: '高频下载、长视频与多设备',
      priceMain: formatYuan(billing.price),
      priceUnit: billing.unit,
      originalPrice: billing.originalPrice
        ? formatYuan(billing.originalPrice)
        : undefined,
      saveHint: billing.saveHint,
      badge: billing.badge ?? '推荐',
      featured: true,
      icon: 'pro',
      ctaLabel: '开通 Pro',
      features: buildProFeatures(limits),
      footnote: billing.footnote
    }
  ]
}

type PricingProps = {
  /** 独立定价页已有大标题时关闭区块标题 */
  showHeading?: boolean
}

export function Pricing({ showHeading = true }: PricingProps): React.JSX.Element {
  const [limits, setLimits] = useState<CloudLimitsConfig>(DEFAULT_LIMITS)
  const [cycle, setCycle] = useState<ProBillingCycle>('yearly')
  const activeIndex = PRO_BILLING_TABS.findIndex((tab) => tab.id === cycle)

  useEffect(() => {
    let cancelled = false
    void fetchLimits().then((next) => {
      if (!cancelled) setLimits(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const plans = useMemo(() => buildPlans(limits, cycle), [limits, cycle])

  return (
    <section className={`${section.section} ${styles.wrap}`} id="pricing">
      {showHeading ? (
        <>
          <p className={section.kicker}>定价</p>
          <h2 className={section.title}>三档方案，按需升级 Pro</h2>
          <p className={section.desc}>
            游客即可试用；登录解锁云同步。切换上方周期查看 Pro 售价。
          </p>
        </>
      ) : null}

      <div className={styles.billingTabs} role="tablist" aria-label="Pro 计费周期">
        <motion.span
          className={styles.billingThumb}
          animate={{
            left: `calc(4px + ${activeIndex} * (100% - 8px) / ${PRO_BILLING_TABS.length})`
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          style={{
            width: `calc((100% - 8px) / ${PRO_BILLING_TABS.length})`
          }}
          aria-hidden
        />
        {PRO_BILLING_TABS.map((tab) => {
          const active = tab.id === cycle
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.billingTab} ${active ? styles.billingTabActive : ''}`}
              onClick={() => setCycle(tab.id)}
            >
              {tab.label}
              {tab.id === 'yearly' ? (
                <span className={styles.tabHint}>推荐</span>
              ) : null}
              {tab.id === 'lifetime' ? (
                <span className={styles.tabHint}>折扣</span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className={styles.grid}>
        {plans.map((plan, index) => (
          <motion.article
            key={plan.id}
            className={`${styles.card} ${plan.featured ? styles.featured : ''}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: index * 0.07 }}
          >
            <header className={styles.cardHead}>
              <span className={styles.planIcon} aria-hidden>
                <Icon name={plan.icon} size={20} />
              </span>
              <div className={styles.cardHeadText}>
                <div className={styles.nameRow}>
                  <h3 className={styles.name}>{plan.name}</h3>
                  {plan.badge ? <span className={styles.badge}>{plan.badge}</span> : null}
                </div>
                <p className={styles.tagline}>{plan.tagline}</p>
              </div>
            </header>

            <div className={styles.priceBlock}>
              <div className={styles.price}>
                <motion.span
                  key={`${plan.id}-${plan.priceMain}-${plan.priceUnit}`}
                  className={styles.priceMain}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                >
                  {plan.priceMain}
                </motion.span>
                <span className={styles.priceUnit}>{plan.priceUnit}</span>
              </div>
              {/* 固定高度副文案槽，避免年付「约合」/永久划线价切换时撑高抖动 */}
              <div className={styles.priceMeta}>
                {plan.originalPrice ? (
                  <span className={styles.priceOriginal}>{plan.originalPrice}</span>
                ) : null}
                {plan.saveHint ? (
                  <span className={styles.saveHint}>{plan.saveHint}</span>
                ) : null}
                {!plan.originalPrice && !plan.saveHint ? (
                  <span className={styles.priceMetaGhost} aria-hidden>
                    约合 ¥13.3 / 月
                  </span>
                ) : null}
              </div>
            </div>

            <ul className={styles.features}>
              {plan.features.map((feature) => (
                <li
                  key={`${plan.id}-${feature.text}`}
                  className={feature.emphasis ? styles.emphasis : undefined}
                >
                  <Icon
                    name={feature.emphasis ? 'starFilled' : 'check'}
                    size={14}
                    className={styles.featureIcon}
                  />
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            <div className={styles.cardFoot}>
              <Link
                className={`${styles.cta} ${plan.featured ? styles.ctaPrimary : ''}`}
                to={DOWNLOAD_LINK}
              >
                <span>{plan.ctaLabel}</span>
                <Icon name="download" size={15} />
              </Link>
              <p className={styles.footnote}>{plan.footnote}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <p className={styles.trust}>
        游客与免费版可日常使用 · Pro 解锁无限下载与长视频 · Mac / Windows
      </p>
    </section>
  )
}
