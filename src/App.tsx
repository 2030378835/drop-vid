import type { JSX } from 'react'
import { HeroStage } from './components/HeroStage'
import { HowItWorks } from './components/HowItWorks'
import { Platforms } from './components/Platforms'
import { Features } from './components/Features'
import { DownloadSection } from './components/DownloadSection'
import { SiteFooter } from './components/SiteFooter'

export default function App(): JSX.Element {
  return (
    <>
      <HeroStage />
      <main>
        <HowItWorks />
        <Platforms />
        <Features />
        <DownloadSection />
      </main>
      <SiteFooter />
    </>
  )
}
