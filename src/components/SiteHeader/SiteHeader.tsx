import type { JSX } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { Icon } from '../Icon'
import styles from './SiteHeader.module.css'

type Props = {
  variant?: 'default' | 'onHero'
  /** onHero 时的色调：brand 偏品牌紫按钮，mono 纯黑白（定价页） */
  tone?: 'brand' | 'mono'
}

const HOME_ANCHORS = [
  { hash: 'how', label: '用法' },
  { hash: 'platforms', label: '平台' },
  { hash: 'features', label: '能力' }
] as const

export function SiteHeader({ variant = 'default', tone = 'brand' }: Props): JSX.Element {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const onPricing = pathname === '/pricing'

  return (
    <header
      className={[
        styles.header,
        variant === 'onHero' ? styles.onHero : '',
        tone === 'mono' ? styles.mono : ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {onHome ? (
        <a className={styles.brand} href="#top" aria-label="DropVid 首页">
          <img src={logo} alt="" width={28} height={28} className={styles.mark} />
          <span>DropVid</span>
        </a>
      ) : (
        <Link className={styles.brand} to="/" aria-label="DropVid 首页">
          <img src={logo} alt="" width={28} height={28} className={styles.mark} />
          <span>DropVid</span>
        </Link>
      )}

      <nav className={styles.nav} aria-label="页面导航">
        {HOME_ANCHORS.map((item) =>
          onHome ? (
            <a key={item.hash} href={`#${item.hash}`}>
              {item.label}
            </a>
          ) : (
            <Link key={item.hash} to={{ pathname: '/', hash: item.hash }}>
              {item.label}
            </Link>
          )
        )}

        {onHome ? (
          <a href="#install">安装说明</a>
        ) : (
          <Link to={{ pathname: '/', hash: 'install' }}>安装说明</Link>
        )}

        <Link
          className={styles.pricingBtn}
          to="/pricing"
          aria-current={onPricing ? 'page' : undefined}
        >
          <Icon name="tag" size={14} />
          <span>定价</span>
        </Link>

        {onHome ? (
          <a className={styles.cta} href="#download">
            <Icon name="download" size={14} />
            <span>下载</span>
          </a>
        ) : (
          <Link className={styles.cta} to={{ pathname: '/', hash: 'download' }}>
            <Icon name="download" size={14} />
            <span>下载</span>
          </Link>
        )}
      </nav>
    </header>
  )
}
