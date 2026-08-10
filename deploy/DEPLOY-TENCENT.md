# 服务器部署 DropVid 官网（dropvid.cn）

整体：**官网** `dropvid.cn` 只托管静态文件；**API** `api.dropvid.cn` 反代到本机 `:3000`（见 `crazy-dropVid-server/deploy/`）。

---

## 第 0 步：DNS（腾讯云）

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `@` | A | `192.144.171.10` |
| `www` | A | `192.144.171.10` |
| `api` | A | `192.144.171.10` |

---

## 第 1 步：SSH 登录服务器

```bash
ssh root@192.144.171.10
```

---

## 第 2 步：确认 API 已在跑

```bash
curl -s http://127.0.0.1:3000/health
pm2 list    # 应有 dropvid-api
```

若没有，在 `/opt/dropvid/server` 按 `crazy-dropVid-server` README 启动。

配置 API 域名 Nginx（只需做一次）：

```bash
bash /opt/dropvid/server/deploy/install-api-nginx.sh
curl -s http://api.dropvid.cn/health
```

---

## 第 3 步：本机构建官网（在你 Mac 上）

```bash
cd drop-vid
pnpm install

export DROPVID_API_BASE=http://192.144.171.10:3000
export VITE_API_BASE_URL=http://api.dropvid.cn   # 上 HTTPS 后改 https://api.dropvid.cn

chmod +x scripts/*.sh
./scripts/build-production.sh
```

得到 `dist/` 目录。

---

## 第 4 步：上传 dist 到服务器

```bash
ssh root@192.144.171.10 "mkdir -p /var/www/drop-vid/dist"

rsync -avz --delete dist/ root@192.144.171.10:/var/www/drop-vid/dist/

# 同时上传 deploy 脚本（首次）
rsync -avz deploy/ root@192.144.171.10:/var/www/drop-vid/deploy/
```

---

## 第 5 步：服务器安装官网 Nginx

```bash
ssh root@192.144.171.10

bash /var/www/drop-vid/deploy/install-site-nginx.sh
```

浏览器访问 `http://dropvid.cn`（DNS 生效后）。

---

## 第 6 步：改后端配置

**`/opt/dropvid/server/.env`：**

```env
CORS_ORIGIN=http://dropvid.cn,https://dropvid.cn,http://www.dropvid.cn,https://www.dropvid.cn
```

改完后：

```bash
pm2 restart dropvid-api
```

**管理后台 → 跳转配置：**

| code | URL |
|------|-----|
| `dropvid_home` | `https://dropvid.cn`（暂 HTTP 则 `http://dropvid.cn`） |
| `pricing` | `https://dropvid.cn/pricing` |

---

## 第 7 步：HTTPS（建议）

1. [腾讯云 SSL](https://console.cloud.tencent.com/ssl) 申请：
   - 证书 1：`dropvid.cn` + `www.dropvid.cn`（官网）
   - 证书 2：`api.dropvid.cn`（API）
2. 证书放到 `/etc/nginx/ssl/`，按 `deploy/nginx.conf.example` 与 `server/deploy/nginx/api.dropvid.cn.conf` 启用 443
3. **重新构建**官网并 rsync（`VITE_API_BASE_URL=https://api.dropvid.cn`）

---

## 以后每次发版

```bash
# 本机
./scripts/build-production.sh
rsync -avz --delete dist/ root@192.144.171.10:/var/www/drop-vid/dist/
```

不用重启 Nginx。

---

## 验收

```bash
curl -s http://dropvid.cn/ | head          # 有 HTML
curl -s http://api.dropvid.cn/health         # ok
curl -s http://api.dropvid.cn/api/v1/config/limits | head
```

浏览器：`/login`、`/legal` 刷新不 404；登录能发邮件/调 API。
