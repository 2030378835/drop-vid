/**
 * @file 云端历史表格列
 * @description 供 DataTable 使用的云历史列配置
 * @author qiangcan
 * @date 2026-08-07
 */

import type { JSX } from "react";
import type { CloudHistoryItem } from "../api/history";
import { PlatformWithLabel } from "../components/PlatformWithLabel";
import type { DataTableColumn } from "../components/DataTable";
import { formatDateTime, formatDuration, formatFileSize } from "./format";
import layoutStyles from "../layout/AccountLayout.module.css";

/** 云历史明细表格列 */
export function cloudHistoryColumns(): DataTableColumn<CloudHistoryItem>[] {
	return [
		{
			key: "title",
			title: "标题",
			width: "26%",
			wrap: true,
			render: (item) => {
				const title = item.title?.trim() || item.fileName;
				return (
					<span className={layoutStyles.cellTitle} title={title}>
						{title}
					</span>
				);
			},
		},
		{
			key: "platform",
			title: "平台",
			width: "10%",
			render: (item) => (
				<PlatformWithLabel platformId={item.platformId || "generic"} size={18} />
			),
		},
		{
			key: "author",
			title: "作者",
			width: "12%",
			render: (item) => item.author?.trim() || "—",
		},
		{
			key: "fileSize",
			title: "大小",
			width: "8%",
			render: (item) => formatFileSize(item.fileSize),
		},
		{
			key: "duration",
			title: "时长",
			width: "8%",
			render: (item) => formatDuration(item.duration),
		},
		{
			key: "completedAt",
			title: "完成时间",
			width: "16%",
			render: (item) => formatDateTime(item.completedAt),
		},
		{
			key: "url",
			title: "链接",
			width: "6%",
			render: (item): JSX.Element | string =>
				item.url?.trim() ? (
					<a
						className={layoutStyles.cellLink}
						href={item.url}
						target="_blank"
						rel="noreferrer noopener"
					>
						打开
					</a>
				) : (
					"—"
				),
		},
	];
}
