import { motion } from 'framer-motion'
import { Icon, type IconName } from '../Icon'
import styles from './HowItWorks.module.css'

const STEPS: Array<{
  n: string
  title: string
  text: string
  icon: IconName
}> = [
  {
    n: '01',
    icon: 'link',
    title: '复制链接',
    text: '在浏览器或 App 里复制公开视频分享链接；也可开启「复制即询问」。'
  },
  {
    n: '02',
    icon: 'paste',
    title: '粘贴解析',
    text: '打开 DropVid 粘贴链接，或点系统通知确认，选择清晰度与格式。'
  },
  {
    n: '03',
    icon: 'folderOpen',
    title: '本地保存',
    text: '文件落到本地文件夹；历史库可收藏、打标签，按平台或作者浏览。'
  }
]

export function HowItWorks(): React.JSX.Element {
  return (
    <section className={styles.wrap} id="how">
      <div className={`layout ${styles.inner}`}>
        <p className={styles.kicker}>用法</p>
        <h2 className={styles.title}>
          你只管复制链接。
          <br />
          <span>剩下的交给 DropVid。</span>
        </h2>
        <p className={styles.desc}>
          像专业工具一样专注一件事：把公开视频链接，变成你电脑里的本地文件。
        </p>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <motion.li
              key={step.n}
              className={styles.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <span className={styles.iconWrap} aria-hidden>
                <Icon name={step.icon} size={22} />
              </span>
              <span className={styles.num}>{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
