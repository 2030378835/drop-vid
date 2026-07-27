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

Gitee raw 会 **302 跳转到 CDN**，且响应**不含 `Access-Control-Allow-Origin`**，GitHub Pages 上**不能**在浏览器里跨域直连 Gitee。

官网改为读取**同域**清单（无 CORS 问题）：

```
https://2030378835.github.io/drop-vid/update/latest.json
```

该文件来源：

1. 仓库内 [`public/update/latest.json`](public/update/latest.json)（本地 dev / 提交兜底）
2. **CI 部署前**从 Gitee CDN 同步（[`deploy.yml`](.github/workflows/deploy.yml)）

发版流程：更新 **push-drop-vid** 的 `update/latest.json` → **重新部署官网**（push `drop-vid` main 或手动 Run workflow）→ 用户刷新即可看到最新下载链接。

本地 `pnpm dev` 会优先读 `public/update/latest.json`；也可通过 Vite 代理拉 Gitee 最新版（见 `vite.config.ts`）。

若同域文件与 Gitee 均不可用，回退 [`src/config/downloads.ts`](src/config/downloads.ts) 中的 `FALLBACK_VERSION`。
