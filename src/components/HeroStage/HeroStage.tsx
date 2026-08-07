import type { JSX } from 'react'
import { SiteHeader } from '../SiteHeader'
import { Hero } from '../Hero'
import styles from './HeroStage.module.css'

/** 顶栏 + Hero 同一视觉平面（JetBrains 式深色产品首屏） */
export function HeroStage(): JSX.Element {
  return (
    <div className={styles.stage} id="top">
      <div className={styles.atmosphere} aria-hidden>
        <span className={styles.glow} />
      </div>
      <SiteHeader variant="onHero" tone="mono" />
      <Hero />
    </div>
  )
}
