import type { JSX } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToHash } from './components/ScrollToHash'
import { routerBasename } from './config/router'
import { Home } from './pages/Home/Home'
import { PricingPage } from './pages/Pricing/PricingPage'

export default function App(): JSX.Element {
  return (
    <BrowserRouter basename={routerBasename()}>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
