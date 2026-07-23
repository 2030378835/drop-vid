import { motion } from 'framer-motion'
import section from '../Section/Section.module.css'
import styles from './HowItWorks.module.css'

const STEPS = [
  {
    n: '01',
    title: '复制链接',
    text: '在浏览器或 App 里复制公开视频分享链接；也可开启「复制即询问」。'
  },
  {
    n: '02',
    title: '粘贴到 DropVid',
    text: '打开应用粘贴链接，或点系统通知确认，选择清晰度与格式。'
  },
  {
    n: '03',
    title: '保存与整理',
    text: '文件落到本地文件夹；历史库可收藏、打标签，按平台或作者浏览。'
  }
]

export function HowItWorks(): React.JSX.Element {
  return (
    <section className={section.section} id="how">
      <p className={section.kicker}>用法</p>
      <h2 className={section.title}>三步完成，几乎零学习成本</h2>
      <p className={section.desc}>像 Downie 一样专注一件事：把链接变成本地视频。</p>

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
            <span className={styles.num}>{step.n}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
