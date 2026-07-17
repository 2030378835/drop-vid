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

已配置 Actions：推送到 `main` 或手动运行 **Deploy GitHub Pages** 工作流。

首次使用请在仓库设置里打开 Pages：

1. **Settings → Pages**
2. **Build and deployment → Source** 选 **GitHub Actions**

上线地址：

`https://2030378835.github.io/drop-vid/`

## 下载链接

只改一处配置：[`src/config/downloads.ts`](src/config/downloads.ts)

```ts
export const APP_VERSION = '0.1.0'

export const MAC_DOWNLOADS = [
  { arch: 'arm64', label: 'Apple Silicon', href: 'https://.../DropVid-0.1.0-arm64.dmg', primary: true },
  { arch: 'x64', label: 'Intel', href: 'https://.../DropVid-0.1.0-x64.dmg' }
]
```

`href` 为空或 `#` 时，对应按钮不可点，页面会提示「尚未配置」。
