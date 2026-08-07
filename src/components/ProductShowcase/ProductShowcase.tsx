import { useEffect, useRef, useState, type CSSProperties, type JSX } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform
} from 'framer-motion'
import darkHomeImg from '../../assets/imgs/home.png'
import heroImg from '../../assets/imgs/hero.png'
import historyImg from '../../assets/imgs/histroy.png'
import userImg from '../../assets/imgs/user.png'
import styles from './ProductShowcase.module.css'

const SCENES = [
  {
    img: darkHomeImg,
    kicker: '首页',
    title: '粘贴任意链接，立刻开始',
    text: '深色界面同样清晰。从剪贴板一键粘贴，选择清晰度即可下载。',
    alt: 'DropVid 深色首页：粘贴链接界面'
  },
  {
    img: heroImg,
    kicker: '下载',
    title: '任务进度一眼看清',
    text: '解析完成后排队下载，封面、平台、清晰度与状态都在任务区里。',
    alt: 'DropVid 首页：带下载任务列表的界面'
  },
  {
    img: historyImg,
    kicker: '历史',
    title: '本地视频库，随时找回',
    text: '按日期浏览记录，支持搜索、收藏，也能按平台或作者整理。',
    alt: 'DropVid 下载历史：按日期整理的本地视频库'
  },
  {
    img: userImg,
    kicker: '账户',
    title: '用量与趋势一目了然',
    text: '今日配额、近 7 日趋势、平台分布与云历史容量集中展示。',
    alt: 'DropVid 账户页：配额、趋势与平台分布'
  }
] as const

const SLIDE_COUNT = SCENES.length

/** 横向滚动画廊：文案固定、截图横滑，滚完最后一页再继续向下 */
export function ProductShowcase(): JSX.Element {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, viewportWidth > 0 ? -viewportWidth * (SLIDE_COUNT - 1) : 0]
  )

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(SLIDE_COUNT - 1, Math.round(value * (SLIDE_COUNT - 1)))
    setActive(next)
  })

  useEffect(() => {
    const node = viewportRef.current
    if (!node) return

    const update = () => setViewportWidth(node.clientWidth)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduceMotion])

  const scene = SCENES[active]

  if (reduceMotion) {
    return (
      <section className={styles.wrapStatic} id="product" aria-label="产品界面">
        <div className={`layout ${styles.staticInner}`}>
          <header className={styles.headStatic}>
            <p className={styles.kicker}>界面</p>
            <h2 className={styles.title}>真实产品长这样</h2>
            <p className={styles.desc}>不是概念图。下面是 DropVid 桌面客户端的实际界面。</p>
          </header>
          <div className={styles.staticList}>
            {SCENES.map((item) => (
              <article key={item.title} className={styles.panelStatic}>
                <figure className={styles.frame}>
                  <img src={item.img} alt={item.alt} loading="lazy" decoding="async" />
                </figure>
                <div className={styles.copy}>
                  <p className={styles.sceneKicker}>{item.kicker}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={containerRef}
      className={styles.wrap}
      id="product"
      aria-label="产品界面"
      style={
        {
          // 略缩短滚距，减少「卡住」感，仍保证每页有足够位移
          height: `${(SLIDE_COUNT - 1) * 85 + 100}vh`,
          '--slides': String(SLIDE_COUNT)
        } as CSSProperties
      }
    >
      <div className={styles.sticky}>
        <div className={`layout ${styles.stickyInner}`}>
          <header className={styles.head}>
            <div className={styles.headCopy}>
              <p className={styles.kicker}>界面</p>
              <h2 className={styles.title}>真实产品长这样</h2>
            </div>

            {/* 场景标签：随滚动高亮，不跟着图横移 */}
            <ul className={styles.tabs} aria-label="界面场景">
              {SCENES.map((item, index) => (
                <li key={item.kicker}>
                  <span
                    className={`${styles.tab} ${index === active ? styles.tabActive : ''}`}
                    aria-current={index === active ? 'true' : undefined}
                  >
                    <em>{String(index + 1).padStart(2, '0')}</em>
                    {item.kicker}
                  </span>
                </li>
              ))}
            </ul>
          </header>

          <div ref={viewportRef} className={styles.viewport}>
            <motion.div className={styles.track} style={{ x }}>
              {SCENES.map((item, index) => (
                <article
                  key={item.title}
                  className={styles.panel}
                  aria-hidden={index !== active}
                  style={{ width: viewportWidth || '100%' }}
                >
                  <figure className={styles.frame}>
                    <img
                      src={item.img}
                      alt={item.alt}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </figure>
                </article>
              ))}
            </motion.div>
          </div>

          {/* 文案固定在下方切换，避免和截图一起横滑显得乱 */}
          <div className={styles.caption}>
            <AnimatePresence mode="wait">
              <motion.div
                key={scene.kicker}
                className={styles.copy}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
              >
                <p className={styles.sceneKicker}>{scene.kicker}</p>
                <h3>{scene.title}</h3>
                <p>{scene.text}</p>
              </motion.div>
            </AnimatePresence>

            <div className={styles.progress} aria-hidden>
              <span
                className={styles.progressFill}
                style={{ width: `${((active + 1) / SLIDE_COUNT) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
