import { motion } from 'framer-motion'
import section from '../Section/Section.module.css'
import styles from './InstallGuide.module.css'

export function InstallGuide(): React.JSX.Element {
  return (
    <section className={`${section.section} ${styles.wrap}`} id="install">
      <p className={section.kicker}>安装说明</p>
      <h2 className={section.title}>首次安装与启动</h2>
      <p className={section.desc}>
        DropVid 当前为内测版，尚未购买 Apple / Microsoft 代码签名。首次打开时系统可能提示「无法验证开发者」或「未知发布者」，这是正常现象，按下面步骤即可正常使用。
      </p>

      <div className={styles.grid}>
        <motion.article
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className={styles.cardHead}>
            <span className={styles.badge}>macOS</span>
            <h3>Mac 安装</h3>
          </div>

          <div className={styles.block}>
            <p className={styles.blockTitle}>安装步骤</p>
            <ol className={styles.list}>
              <li>下载对应芯片的安装包（Apple Silicon 或 Intel）。</li>
              <li>打开 .dmg，将 DropVid 拖入「应用程序」文件夹。</li>
              <li>在启动台或「应用程序」中打开 DropVid。</li>
            </ol>
          </div>

          <div className={styles.warn}>
            <p className={styles.warnTitle}>首次启动可能看到的安全提示</p>
            <p>
              系统可能弹出类似「无法打开 DropVid，因为无法验证开发者」或「Apple
              无法检查此 App 是否包含恶意软件」。内测版未签名时都会出现，不代表软件有毒。
            </p>
            <ol className={styles.warnList}>
              <li>
                <strong>推荐：</strong>在「应用程序」中<strong>按住 Control 键点击</strong>
                DropVid，选择「打开」，在弹窗中再次点「打开」。
              </li>
              <li>
                若仍被拦截：打开「系统设置 → 隐私与安全性」，向下找到 DropVid
                相关提示，点击「仍要打开」。
              </li>
              <li>
                从浏览器刚下载完时：也可在 .dmg 里对 DropVid
                右键「打开」一次，完成首次放行后再从启动台正常打开。
              </li>
            </ol>
          </div>
        </motion.article>

        <motion.article
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: 0.06 }}
        >
          <div className={styles.cardHead}>
            <span className={styles.badge}>Windows</span>
            <h3>Windows 安装</h3>
          </div>

          <div className={styles.block}>
            <p className={styles.blockTitle}>安装步骤</p>
            <ol className={styles.list}>
              <li>下载 .exe 安装程序（Windows 10 / 11，64 位）。</li>
              <li>双击运行，按向导选择安装目录并完成安装。</li>
              <li>从开始菜单或桌面快捷方式启动 DropVid。</li>
            </ol>
          </div>

          <div className={styles.warn}>
            <p className={styles.warnTitle}>首次启动可能看到的安全提示</p>
            <p>
              SmartScreen 可能显示「Windows 已保护你的电脑」或发布者为「未知」。未签名的内测安装包常见此提示。
            </p>
            <ol className={styles.warnList}>
              <li>
                在蓝色 SmartScreen 窗口点「<strong>更多信息</strong>」，再点「
                <strong>仍要运行</strong>」继续安装或启动。
              </li>
              <li>
                若安装包无法运行：在 .exe 上右键 →「属性」→ 若底部有「解除锁定 / Unblock」，勾选后点「确定」，再重新运行。
              </li>
              <li>
                企业电脑若由 IT 统一管理，可能需要管理员批准；个人电脑按上述步骤即可。
              </li>
            </ol>
          </div>
        </motion.article>
      </div>

      <p className={styles.footnote}>
        正式版计划接入代码签名，届时上述提示会明显减少。若你仍不放心，可在虚拟机或备用账号中先试跑；下载引擎已内置在安装包内，首次启动无需再联网安装。
      </p>
    </section>
  )
}
