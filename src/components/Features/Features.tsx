import { motion } from 'framer-motion'
import { Icon, type IconName } from '../Icon'
import styles from './Features.module.css'

const FEATURES: Array<{
  title: string
  text: string
  icon: IconName
}> = [
  {
    icon: 'paste',
    title: '粘贴即可',
    text: '识别分享短链与常见视频页，解析后可直接排队下载。'
  },
  {
    icon: 'notification',
    title: '复制即询问',
    text: '开启后复制白名单链接会弹出系统通知，点一下才开始下载。'
  },
  {
    icon: 'security',
    title: 'Cookie 一次导入',
    text: '从 Chrome / Edge / Safari 导入登录态，后续下载走本地缓存。'
  },
  {
    icon: 'history',
    title: '历史库整理',
    text: '收藏、标签、按平台/作者分组，支持批量管理与扫描导入本地文件。'
  },
  {
    icon: 'devices',
    title: '托盘常驻',
    text: '关窗不退出，菜单栏/托盘一键唤起；支持全局快捷粘贴下载。'
  },
  {
    icon: 'lock',
    title: '本地优先',
    text: '数据与 Cookie 留在你的电脑；不上传账号密码到云端。'
  }
]

export function Features(): React.JSX.Element {
  return (
    <section className={styles.wrap} id="features">
      <div className={`layout ${styles.inner}`}>
        <p className={styles.kicker}>能力</p>
        <h2 className={styles.title}>把下载这件事做到顺手</h2>
        <p className={styles.desc}>不做臃肿工具箱。从粘贴、解析到整理，每一步都围绕效率。</p>

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
              <span className={styles.iconWrap} aria-hidden>
                <Icon name={item.icon} size={20} />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
