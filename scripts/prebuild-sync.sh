#!/usr/bin/env bash
# 构建前同步：Gitee 更新清单 + 服务端 platforms/limits 静态兜底
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API_BASE="${DROPVID_API_BASE:-http://127.0.0.1:3000}"
GITEE_LATEST_URL="${GITEE_LATEST_URL:-https://raw.giteeusercontent.com/qq2057187934/push-drop-vid/raw/master/update/latest.json}"

echo "→ 同步 update/latest.json"
mkdir -p public/update
curl -fsSL "$GITEE_LATEST_URL" -o public/update/latest.json

echo "→ 同步 config/platforms.json、config/limits.json（API: $API_BASE）"
mkdir -p public/config
curl -fsSL "${API_BASE}/api/v1/config/platforms" -o public/config/platforms.json
curl -fsSL "${API_BASE}/api/v1/config/limits" -o public/config/limits.json

python3 - <<'PY'
import json, pathlib, sys
root = pathlib.Path("public/config")
for name in ("platforms.json", "limits.json"):
    path = root / name
    data = json.loads(path.read_text())
    if data.get("ok") is not True:
        print(f"invalid {name}: {data}", file=sys.stderr)
        sys.exit(1)
print("cloud config synced")
PY

echo "✓ prebuild sync done"
