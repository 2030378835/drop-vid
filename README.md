# DropVid 官网

Crazy DropVid 产品官网，React + Vite。

## 开发

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
pnpm preview
```

模拟 GitHub Pages 子路径构建：

```bash
VITE_BASE=/drop-vid/ pnpm build
```

## GitHub Pages 部署

推送到 `main`（或手动跑 **Deploy GitHub Pages**）后，Actions 会构建并**直接发布**到 GitHub Pages，不再依赖 `gh-pages` 分支。

**首次必做**（否则站点不会更新）：

1. 打开 [仓库 Settings → Pages](https://github.com/2030378835/drop-vid/settings/pages)
2. **Build and deployment → Source** 选 **GitHub Actions**（不要选 Deploy from a branch）
3. 推送一次 `main`，或在 Actions 里手动 **Run workflow**
4. 打开：`https://2030378835.github.io/drop-vid/`

可在 [Actions](https://github.com/2030378835/drop-vid/actions) 查看部署是否成功。

## 下载链接

官网会在**运行时**从 Gitee 拉取最新版本清单（与桌面端共用数据源）：

```
https://gitee.com/qq2057187934/push-drop-vid/raw/master/update/latest.json
```

发版时只需更新 **push-drop-vid** 仓库中的 [`update/latest.json`](update/latest.json)，官网刷新后即可展示最新版本与下载地址，无需再改官网代码。

若 Gitee 暂不可达（网络 / CORS），会回退到 [`src/config/downloads.ts`](src/config/downloads.ts) 中的 `FALLBACK_VERSION` 兜底链接。
