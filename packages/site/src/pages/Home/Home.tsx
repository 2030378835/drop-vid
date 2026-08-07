import type { JSX } from 'react'
import { HeroStage } from '../../components/HeroStage/HeroStage'
import { HowItWorks } from '../../components/HowItWorks/HowItWorks'
import { ProductShowcase } from '../../components/ProductShowcase'
import { Platforms } from '../../components/Platforms/Platforms'
import { Features } from '../../components/Features/Features'
import { DownloadSection } from '../../components/DownloadSection/DownloadSection'
import { InstallGuide } from '../../components/InstallGuide/InstallGuide'
import { SiteFooter } from '../../components/SiteFooter/SiteFooter'

/** 官网落地页 */
export function Home(): JSX.Element {
  return (
    <>
      <HeroStage />
      <main>
        <HowItWorks />
        <ProductShowcase />
        <Platforms />
        <Features />
        <DownloadSection />
        <InstallGuide />
      </main>
      <SiteFooter />
    </>
  )
}
