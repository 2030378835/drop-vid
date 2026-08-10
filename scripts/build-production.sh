#!/usr/bin/env bash
# 生产构建：同步静态配置后 vite build
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 根域名部署用 /；GitHub Pages 子路径才需要 /drop-vid/
export VITE_BASE="${VITE_BASE:-/}"

# 与页面同域反代 /api 时填站点根 URL（勿带尾斜杠），例如：
#   http://192.144.171.10
#   https://www.dropvid.com
# 若 API 仍走独立端口且与页面同为 HTTP，可填 http://IP:3000
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-}"

echo "VITE_BASE=$VITE_BASE"
echo "VITE_API_BASE_URL=${VITE_API_BASE_URL:-（未设置，打包后将使用 packages/shared 默认地址）}"

"$(dirname "$0")/prebuild-sync.sh"
pnpm build

echo "✓ dist/ 已生成，可用 nginx / COS 部署"
