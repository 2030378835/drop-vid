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

推送到 `main`（或手动跑 **Deploy GitHub Pages**）后，Actions 会构建并发布到 `gh-pages` 分支。

**首次必做**（否则会一直 404）：

1. 打开 [仓库 Settings → Pages](https://github.com/2030378835/drop-vid/settings/pages)
2. **Build and deployment → Source** 选 **Deploy from a branch**
3. **Branch** 选 `gh-pages` / `/ (root)`，保存
4. 等 1～2 分钟，打开：`https://2030378835.github.io/drop-vid/`

可在 [Actions](https://github.com/2030378835/drop-vid/actions) 查看部署是否成功。

## 下载链接

只改一处配置：[`src/config/downloads.ts`](src/config/downloads.ts)

```ts
export const VERSION = '0.1.2'
```

安装包地址会按 `v${VERSION}` 自动拼到 GitHub Release。`href` 为空或 `#` 时，对应按钮不可点。

应用内更新元数据见 [`update/latest.json`](update/latest.json)（与 `push-drop-vid` 保持一致）。
