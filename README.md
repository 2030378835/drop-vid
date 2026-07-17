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
