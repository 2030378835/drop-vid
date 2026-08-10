#!/usr/bin/env bash
# 在服务器上安装 dropvid.cn 官网 Nginx 配置
# 用法：bash /var/www/drop-vid/deploy/install-site-nginx.sh

set -euo pipefail

SITE_ROOT="${SITE_ROOT:-/var/www/drop-vid}"
CONF_NAME="dropvid.cn.conf"
SRC="${SITE_ROOT}/deploy/nginx.conf.example"
DEST="/etc/nginx/sites-available/${CONF_NAME}"

if [[ ! -f "$SRC" ]]; then
  echo "缺少配置: $SRC（请先上传 drop-vid 仓库或 dist 同级的 deploy/）" >&2
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "安装 Nginx..." >&2
  apt-get update && apt-get install -y nginx
fi

mkdir -p /var/www/drop-vid/dist /etc/nginx/sites-available /etc/nginx/sites-enabled
cp "$SRC" "$DEST"
ln -sf "$DEST" "/etc/nginx/sites-enabled/${CONF_NAME}"

nginx -t
systemctl reload nginx

echo ""
echo "官网 Nginx 已加载 ${CONF_NAME}"
echo "站点目录: /var/www/drop-vid/dist"
echo "验证: curl -s -H 'Host: dropvid.cn' http://127.0.0.1/ | head"
