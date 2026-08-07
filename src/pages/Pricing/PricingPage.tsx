import { useEffect, type JSX } from 'react'
import { SiteHeader } from '../../components/SiteHeader'
import { Pricing } from '../../components/Pricing'
import { SiteFooter } from '../../components/SiteFooter/SiteFooter'
import styles from './PricingPage.module.css'

/** 独立定价页：供客户端 deep link 打开 */
export function PricingPage(): JSX.Element {
  useEffect(() => {
    const previous = document.title
    document.title = '定价 · DropVid'
    window.scrollTo(0, 0)
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <div className={styles.atmosphere} aria-hidden />
        <SiteHeader variant="onHero" tone="mono" />
        <div className={styles.bannerInner}>
          <p className={styles.kicker}>Pricing</p>
          <h1 className={styles.title}>选择适合你的方案</h1>
          <p className={styles.lead}>
            游客与免费版可直接使用；Pro 支持月付、年付与永久买断。
          </p>
        </div>
      </div>

      <main className={styles.main}>
        <Pricing showHeading={false} />
      </main>
      <SiteFooter />
    </div>
  )
}
