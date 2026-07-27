/** Gitee 发布仓（与 crazy-dropVid / push-drop-vid 共用） */
export const GITEE_UPDATE = {
  owner: 'qq2057187934',
  repo: 'push-drop-vid',
  latestManifestPath: 'update/latest.json'
} as const

/** 运行时拉取 latest.json 的 raw 直链（master / main 双分支兜底） */
export function latestManifestUrls(): string[] {
  const { owner, repo, latestManifestPath } = GITEE_UPDATE
  return ['master', 'main'].map(
    (branch) => `https://gitee.com/${owner}/${repo}/raw/${branch}/${latestManifestPath}`
  )
}
