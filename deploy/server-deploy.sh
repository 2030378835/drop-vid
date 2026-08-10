#!/usr/bin/env bash
# 在服务器上：git pull → 安装依赖 → 构建 → 输出 dist/
# 用法：
#   bash deploy/server-deploy.sh
#   bash deploy/server-deploy.sh --branch main
#
# 首次请先 clone 仓库并复制 deploy/env.server.example → deploy/env.server

set -euo pipefail

SITE_ROOT="${SITE_ROOT:-/opt/dropvid/site}"
BRANCH="${BRANCH:-main}"

cd "$SITE_ROOT"

# 加载服务器环境变量（VITE_API_BASE_URL、DROPVID_API_BASE 等）
ENV_FILE="${SITE_ROOT}/deploy/env.server"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "提示: 未找到 ${ENV_FILE}，将使用脚本内默认值" >&2
  export DROPVID_API_BASE="${DROPVID_API_BASE:-http://127.0.0.1:3000}"
  export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://api.dropvid.cn}"
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    *)
      echo "未知参数: $1" >&2
      exit 1
      ;;
  esac
done

if ! command -v git >/dev/null 2>&1; then
  echo "请先安装 git" >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "请先安装 pnpm: npm install -g pnpm" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "请先安装 Node.js >= 20" >&2
  exit 1
fi

echo "→ git fetch & checkout ${BRANCH}"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "→ pnpm install"
pnpm install --frozen-lockfile

chmod +x scripts/*.sh deploy/*.sh 2>/dev/null || true

echo "→ build"
export VITE_BASE="${VITE_BASE:-/}"
./scripts/build-production.sh

echo ""
echo "✓ 构建完成: ${SITE_ROOT}/dist"
echo "  Nginx root 应指向该目录；无需重启 Nginx（静态文件已更新）"
