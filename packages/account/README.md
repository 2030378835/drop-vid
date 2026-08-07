# @dropvid/account

DropVid 用户中心：登录 + 控制台各子页面。

## 结构

```
src/
  layout/          公共布局（侧边栏 + 内容区 Outlet）
  pages/           每个子页面独立目录
    Login/
    Overview/
    Usage/
    Analytics/
    Export/
    Devices/
    Settings/
  routes/          路径常量与导航配置
  hooks/           页面共用逻辑
  api/ auth/ utils/
```

## 路由

| 路径 | 页面 |
|------|------|
| `/login` | 登录 |
| `/account/overview` | 概览 |
| `/account/usage` | 用量 |
| `/account/analytics` | 数据分析（含 CSV 导出） |
| `/account/devices` | 登录设备 |
| `/account/settings` | 账户设置 |

未登录访问 `/account/*` 会跳转 `/login`；已登录访问 `/login` 会跳转 `/account/overview`。

## 开发

```bash
pnpm dev:account   # 独立运行，端口 5174
```
