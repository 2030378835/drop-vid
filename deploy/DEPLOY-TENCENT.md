# 腾讯云部署 DropVid 官网（dropvid.cn）

官网是 **Vite 静态 SPA**（`drop-vid`），后端 API 在 `192.144.171.10:3000`（`crazy-dropVid-server`）。  
**推荐**：同一台机器 Nginx 托管 `dropvid.cn`，并反代 `/api` → `127.0.0.1:3000`。

## 架构

```
https://dropvid.cn
    │
    ▼
Nginx :443 / :80  ──► /           → /var/www/drop-vid/dist
                 ──► /api/*      → 127.0.0.1:3000
                 ──► /config/*   → dist/config/*.json
                 ──► /update/*   → dist/update/latest.json
```

---

## 一、域名解析（腾讯云 DNS）

在 [DNS 解析](https://console.cloud.tencent.com/cns) 为 `dropvid.cn` 添加：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `@` | A | `192.144.171.10` |
| `www` | A | `192.144.171.10` |

备案未完成前，部分运营商可能对 `.cn` 域名有访问限制，可先通过 IP 验证 Nginx 与 API。

---

## 二、安全组

| 端口 | 用途 |
|------|------|
| 22 | SSH |
| 80 | HTTP（证书签发 / 跳转 HTTPS） |
| 443 | HTTPS 官网 |
| 3000 | **勿对公网开放**，仅本机反代 |

---

## 三、构建官网

```bash
cd drop-vid
pnpm install

# 在服务器上构建时可写 127.0.0.1；本机构建写公网 IP
export DROPVID_API_BASE=http://192.144.171.10:3000

# 与页面同域（上 SSL 后用 https）
export VITE_API_BASE_URL=https://dropvid.cn
# 证书未就绪前临时：export VITE_API_BASE_URL=http://dropvid.cn

chmod +x scripts/*.sh
./scripts/build-production.sh
```

---

## 四、上传到服务器

```bash
rsync -avz --delete dist/ root@192.144.171.10:/var/www/drop-vid/dist/
```

---

## 五、Nginx

```bash
sudo mkdir -p /var/www/drop-vid /etc/nginx/ssl/dropvid.cn
sudo cp deploy/nginx.conf.example /etc/nginx/conf.d/dropvid.conf
sudo nginx -t && sudo systemctl reload nginx
```

- **未上 SSL**：使用配置里已启用的 `listen 80` 块，访问 `http://dropvid.cn`
- **已上 SSL**：按 `nginx.conf.example` 注释说明启用 443 块，HTTP 301 到 `https://dropvid.cn`

### SSL 证书（腾讯云免费）

1. [SSL 证书控制台](https://console.cloud.tencent.com/ssl) → 申请免费证书（域名填 `dropvid.cn`，可含 `www.dropvid.cn`）
2. 下载 **Nginx** 格式，上传到 `/etc/nginx/ssl/dropvid.cn/`
3. 启用 443 配置并 reload

---

## 六、后端必改项

**API `.env`：**

```env
CORS_ORIGIN=https://dropvid.cn,https://www.dropvid.cn,http://dropvid.cn
NODE_ENV=production
```

**管理后台 → 跳转配置：**

| code | URL |
|------|-----|
| `dropvid_home` | `https://dropvid.cn` |
| `pricing` | `https://dropvid.cn/pricing` |

邮件登录/注册链接会拼在 `dropvid_home` 上，务必为 HTTPS 且可公网访问。

---

## 七、验收清单

- [ ] `https://dropvid.cn` 首页正常
- [ ] `https://dropvid.cn/login` 刷新不 404
- [ ] `https://dropvid.cn/legal` Tab 可切换
- [ ] 登录 / 注册邮件链接域名是 `dropvid.cn`
- [ ] `curl -s https://dropvid.cn/api/v1/config/limits` 返回 JSON

---

## 八、发版

```bash
./scripts/build-production.sh
rsync -avz --delete dist/ root@192.144.171.10:/var/www/drop-vid/dist/
```

更新 Gitee `push-drop-vid` 的 `latest.json` 后重新构建，下载按钮才会指向新版本。

---

## 常见问题

**登录/API 失败** → 检查 `VITE_API_BASE_URL` 是否为 `https://dropvid.cn`，以及 Nginx `/api/` 反代。

**www 与裸域** → 建议统一跳转到 `https://dropvid.cn`（见 nginx 配置注释）。

**GitHub Pages** → 可与 `dropvid.cn` 并存作备用；正式环境以 `dropvid.cn` 为准。
