# 服务器部署 DropVid 官网（dropvid.cn）

整体：**官网** `dropvid.cn` → Nginx 托管 `dist/`；**API** `api.dropvid.cn` → 反代本机 `:3000`。

推荐在服务器 **`git pull` + 构建**，与 API 仓库（`/opt/dropvid/server`）用法一致。

---

## 两种部署方式

| 方式 | 优点 | 缺点 |
|------|------|------|
| **Git 拉取（推荐）** | 服务器一条命令发版；与后端 workflow 一致 | 服务器需装 Node + pnpm |
| rsync 上传 dist | 服务器不用装 Node | 每次在本机构建再上传 |

---

## 第 0 步：DNS

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `@` | A | `192.144.171.10` |
| `www` | A | `192.144.171.10` |
| `api` | A | `192.144.171.10` |

---

## 第 1 步：服务器首次初始化（只做一次）

```bash
ssh root@192.144.171.10

# Node 22 + pnpm（若尚未安装）
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git nginx
npm install -g pnpm

# 克隆官网仓库（换成你的 Git 地址）
mkdir -p /opt/dropvid
git clone https://github.com/2030378835/drop-vid.git /opt/dropvid/site
cd /opt/dropvid/site

# 服务器构建环境
cp deploy/env.server.example deploy/env.server
vim deploy/env.server   # 确认 VITE_API_BASE_URL、DROPVID_API_BASE

# Nginx
bash deploy/install-site-nginx.sh
```

私有仓库需在服务器配 SSH deploy key 或 HTTPS token。

---

## 第 2 步：确认 API

```bash
curl -s http://127.0.0.1:3000/health
bash /opt/dropvid/server/deploy/install-api-nginx.sh   # 若尚未配置
curl -s http://api.dropvid.cn/health
```

**`/opt/dropvid/server/.env`：**

```env
CORS_ORIGIN=http://dropvid.cn,https://dropvid.cn,http://www.dropvid.cn,https://www.dropvid.cn
```

```bash
pm2 restart dropvid-api
```

管理后台跳转：`dropvid_home` → `http://dropvid.cn`，`pricing` → `http://dropvid.cn/pricing`。

---

## 第 3 步：发版（以后每次）

本地 push 到 `main` 后，在服务器：

```bash
ssh root@192.144.171.10
cd /opt/dropvid/site
bash deploy/server-deploy.sh
```

等价于：`git pull` → `pnpm install` → 同步 config → `vite build` → 更新 `dist/`。

**不用重启 Nginx**（root 一直指向 `/opt/dropvid/site/dist`）。

---

## 备选：本机构建 + rsync

不想在服务器装 Node 时：

```bash
# 本机
export DROPVID_API_BASE=http://192.144.171.10:3000
export VITE_API_BASE_URL=http://api.dropvid.cn
./scripts/build-production.sh
rsync -avz --delete dist/ root@192.144.171.10:/opt/dropvid/site/dist/
```

---

## HTTPS

1. 腾讯云申请 `dropvid.cn`、`api.dropvid.cn` 证书  
2. Nginx 启用 443  
3. 改 `deploy/env.server` 里 `VITE_API_BASE_URL=https://api.dropvid.cn`  
4. 再跑 `bash deploy/server-deploy.sh`

---

## 验收

```bash
curl -s http://dropvid.cn/ | head
curl -s http://api.dropvid.cn/health
curl -s http://api.dropvid.cn/api/v1/config/limits | head
```

浏览器：`/login`、`/legal` 刷新不 404。
