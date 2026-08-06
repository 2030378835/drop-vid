import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchLimits } from '../../api/fetchLimits'
import { DEFAULT_LIMITS, type CloudLimitsConfig } from '../../types/cloudConfig'
import {
  formatDurationCapHint,
  formatQuotaMain,
  isUnlimitedLimit
} from '../../utils/quotaDisplay'
import section from '../Section/Section.module.css'
import styles from './Pricing.module.css'

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
  featured?: boolean
  ctaLabel: string
  ctaHref: string
  features: PlanFeature[]
  footnote: string
}

function buildPlans(limits: CloudLimitsConfig): PlanCard[] {
  const guestCap = formatDurationCapHint(limits.guest.durationBuckets) ?? '短视频'
  const freeCap = formatDurationCapHint(limits.free.durationBuckets) ?? '中等时长'
  const guestConcurrent = limits.guest.maxConcurrentDownloads ?? 1
  const freeConcurrent = limits.free.maxConcurrentDownloads ?? 1
  const proConcurrent = limits.pro.maxConcurrentDownloads ?? 3
  const freeMaxDevices = limits.free.maxDevices ?? 1
  const proMaxDevices = limits.pro.maxDevices ?? 3

  const freeCloud = isUnlimitedLimit(limits.free.cloudHistory)
    ? '云历史不限'
    : `云历史 ${limits.free.cloudHistory ?? 0} 条`
  const proCloud = isUnlimitedLimit(limits.pro.cloudHistory)
    ? '云历史不限'
    : `云历史 ${limits.pro.cloudHistory ?? 0} 条`

  return [
    {
      id: 'guest',
      name: '游客',
      tagline: '快速试用，粘贴即可下载短视频',
      priceMain: formatQuotaMain(limits.guest.dailyDownload),
      priceUnit: '/ 天 · 本机',
      ctaLabel: '免费下载试用',
      ctaHref: '#download',
      features: [
        { text: `每日 ${formatQuotaMain(limits.guest.dailyDownload)} 本机下载` },
        { text: `单条时长 ${guestCap}` },
        { text: '多平台粘贴解析' },
        { text: '高清本地保存' },
        {
          text:
            guestConcurrent <= 1
              ? '最多支持 1 条视频同时下载'
              : `最多支持 ${guestConcurrent} 条视频同时下载`
        }
      ],
      footnote: '无需登录；配额记在本机，登录后可升级免费版云同步。'
    },
    {
      id: 'free',
      name: '免费版',
      tagline: '登录后同步清单，适合日常下载',
      priceMain: formatQuotaMain(limits.free.dailyDownload),
      priceUnit: '/ 天 · 登录',
      ctaLabel: '下载并登录',
      ctaHref: '#download',
      features: [
        { text: '包含游客全部能力，以及：', emphasis: true },
        { text: `每日 ${formatQuotaMain(limits.free.dailyDownload)} 下载配额` },
        { text: `单条时长放宽至 ${freeCap}` },
        { text: freeCloud },
        { text: '跨设备同步下载清单' },
        {
          text:
            freeMaxDevices <= 1
              ? '最多支持 1 个设备登录'
              : `最多支持 ${freeMaxDevices} 个设备登录`
        },
        {
          text:
            freeConcurrent <= 1
              ? '最多支持 1 条视频同时下载'
              : `最多支持 ${freeConcurrent} 条视频同时下载`
        }
      ],
      footnote: '免费登录即可使用；更长视频与无限次数请升级 Pro。'
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: '高频下载、长视频与多设备同步',
      priceMain: formatQuotaMain(limits.pro.dailyDownload),
      priceUnit: '/ 天 · 会员',
      featured: true,
      ctaLabel: '下载客户端开通',
      ctaHref: '#download',
      features: [
        { text: '包含免费版全部能力，以及：', emphasis: true },
        { text: '每日下载次数不限' },
        { text: '单条视频时长不限' },
        { text: proCloud },
        { text: `最多支持 ${proMaxDevices} 个设备登录` },
        { text: `最多支持 ${proConcurrent} 条视频同时下载` },
        { text: '优先体验新平台支持' }
      ],
      footnote: '配额由服务端实时生效；开通请在客户端账户页或联系反馈邮箱。'
    }
  ]
}

export function Pricing(): React.JSX.Element {
  const [limits, setLimits] = useState<CloudLimitsConfig>(DEFAULT_LIMITS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetchLimits().then((next) => {
      if (cancelled) return
      setLimits(next)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const plans = useMemo(() => buildPlans(limits), [limits])

  return (
    <section className={`${section.section} ${styles.wrap}`} id="pricing">
      <p className={section.kicker}>定价</p>
      <h2 className={section.title}>三档方案，配额随服务端生效</h2>
      <p className={section.desc}>
        {ready
          ? '游客即可试用；登录解锁云同步，Pro 面向高频与长视频场景。'
          : '正在同步服务端配额配置…'}
      </p>

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
            {plan.featured ? <span className={styles.badge}>推荐</span> : null}
            <h3 className={styles.name}>{plan.name}</h3>
            <p className={styles.tagline}>{plan.tagline}</p>
            <div className={styles.price}>
              <span className={styles.priceMain}>{plan.priceMain}</span>
              <span className={styles.priceUnit}>{plan.priceUnit}</span>
            </div>
            <a
              className={`${styles.cta} ${plan.featured ? styles.ctaPrimary : ''}`}
              href={plan.ctaHref}
            >
              {plan.ctaLabel}
            </a>
            <ul className={styles.features}>
              {plan.features.map((feature) => (
                <li
                  key={feature.text}
                  className={feature.emphasis ? styles.emphasis : undefined}
                >
                  {feature.text}
                </li>
              ))}
            </ul>
            <p className={styles.footnote}>{plan.footnote}</p>
          </motion.article>
        ))}
      </div>

      <p className={styles.trust}>
        为创作者与收藏党准备 · 多平台解析 · 高清本地保存 · Mac / Windows
      </p>
    </section>
  )
}
