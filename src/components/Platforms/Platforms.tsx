import { motion } from "framer-motion";
import section from "../Section/Section.module.css";
import styles from "./Platforms.module.css";
import bilibiliIcon from "./logos/bilibili.svg";
import douyinIcon from "./logos/douyin.svg";
import youtubeIcon from "./logos/youtube.svg";
import xIcon from "./logos/x.svg";
import instagramIcon from "./logos/instagram.svg";
import redbookIcon from "./logos/xiaohongshu.svg";
import xinpianchangIcon from "./logos/xinpianchang.svg";
import wechatVideoIcon from "./logos/weixin.svg";

const PLATFORMS = [
  { name: "抖音", note: "分享短链 / 视频页", icon: douyinIcon },
	{ name: "微信视频号", note: "需登录 Cookie", icon: wechatVideoIcon },
	{ name: "小红书", note: "需登录 Cookie", icon: redbookIcon },
	{ name: "新片场", note: "需登录 Cookie", icon: xinpianchangIcon },
	{ name: "B站", note: "推荐导入 Cookie", icon: bilibiliIcon },
	{ name: "YouTube", note: "公开视频", icon: youtubeIcon },
	{ name: "Twitter / X", note: "推文中的视频", icon: xIcon },
	{ name: "Instagram", note: "需登录 Cookie", icon: instagramIcon },
];

export function Platforms(): React.JSX.Element {
	return (
		<section className={`${section.section} ${styles.wrap}`} id="platforms">
			<p className={section.kicker}>平台</p>
			<h2 className={section.title}>覆盖日常最常用的视频来源</h2>
			<p className={section.desc}>
				部分站点需要浏览器 Cookie；微信视频号、快手、新片场素材站等暂不支持。
			</p>

			<ul className={styles.list}>
				{PLATFORMS.map((item, index) => (
					<motion.li
						key={item.name}
						className={item?.icon ? undefined : styles.filler}
						initial={{ opacity: 0, y: 12 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.5 }}
						transition={{ duration: 0.4, delay: index * 0.05 }}
					>
						<strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
							{item.icon && (
								<img width={24} height={24} src={item.icon} alt={item.name} />
							)}
							{item.name}
						</strong>
						<span>{item.note}</span>
					</motion.li>
				))}
			</ul>
		</section>
	);
}
