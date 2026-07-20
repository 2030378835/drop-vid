import type { JSX } from 'react'
import { SiteHeader } from '../SiteHeader'
import { Hero } from '../Hero'
import styles from './HeroStage.module.css'

/** 顶栏 + Hero 同一视觉平面；高度随内容，避免首屏底部大块空带 */
export function HeroStage(): JSX.Element {
  return (
    <div className={styles.stage} id="top">
      <div className={styles.atmosphere} aria-hidden>
        <span className={styles.orbA} />
        <span className={styles.orbB} />
        <span className={styles.orbC} />
      </div>
      <SiteHeader variant="onHero" />
      <Hero />
    </div>
  )
}
