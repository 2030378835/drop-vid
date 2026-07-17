import { motion } from 'framer-motion'
import section from './Section.module.css'
import styles from './Platforms.module.css'

const PLATFORMS = [
  { name: 'B站', note: '推荐导入 Cookie' },
  { name: '抖音', note: '分享短链 / 视频页' },
  { name: 'YouTube', note: '公开视频' },
  { name: '小红书', note: '需登录 Cookie' },
  { name: '直链', note: 'mp4 / mov / webm' }
]

export function Platforms(): React.JSX.Element {
  return (
    <section className={`${section.section} ${styles.wrap}`} id="platforms">
      <p className={section.kicker}>平台</p>
      <h2 className={section.title}>覆盖日常最常用的视频来源</h2>
      <p className={section.desc}>
        部分站点需要浏览器 Cookie；微信视频号、快手等暂不支持。
      </p>

      <ul className={styles.list}>
        {PLATFORMS.map((item, index) => (
          <motion.li
            key={item.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <strong>{item.name}</strong>
            <span>{item.note}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
