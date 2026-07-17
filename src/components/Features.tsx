import { motion } from 'framer-motion'
import section from './Section.module.css'
import styles from './Features.module.css'

const FEATURES = [
  {
    title: '粘贴即可',
    text: '识别分享短链与常见视频页，解析后可直接排队下载。'
  },
  {
    title: 'Cookie 一次导入',
    text: '从 Chrome / Edge / Safari 导入登录态，后续下载走本地缓存。'
  },
  {
    title: '队列与历史',
    text: '多任务排队、暂停继续，完成后可在历史里快速打开文件。'
  },
  {
    title: '本地优先',
    text: '数据与 Cookie 留在你的电脑；不上传账号密码到云端。'
  }
]

export function Features(): React.JSX.Element {
  return (
    <section className={section.section} id="features">
      <p className={section.kicker}>能力</p>
      <h2 className={section.title}>为「快」和「省心」而做</h2>
      <p className={section.desc}>不做臃肿工具箱，把下载这件事做到顺手。</p>

      <div className={styles.grid}>
        {FEATURES.map((item, index) => (
          <motion.article
            key={item.title}
            className={styles.item}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
          >
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
