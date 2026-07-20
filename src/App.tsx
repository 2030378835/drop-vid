import type { JSX } from 'react'
import { HeroStage } from './components/HeroStage/HeroStage'
import { HowItWorks } from './components/HowItWorks/HowItWorks'
import { Platforms } from './components/Platforms/Platforms'
import { Features } from './components/Features/Features'
import { DownloadSection } from './components/DownloadSection/DownloadSection'
import { InstallGuide } from './components/InstallGuide/InstallGuide'
import { SiteFooter } from './components/SiteFooter/SiteFooter'

export default function App(): JSX.Element {
  return (
    <>
      <HeroStage />
      <main>
        <HowItWorks />
        <Platforms />
        <Features />
        <DownloadSection />
        <InstallGuide />
      </main>
      <SiteFooter />
    </>
  )
}
