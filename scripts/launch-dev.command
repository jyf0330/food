#!/bin/zsh

set -e

PROJECT_DIR="/Users/macminim4/Documents/New project/food"
WORKSPACE_NODE="/Users/macminim4/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"
PORT="3001"
URL="http://localhost:${PORT}"

cd "$PROJECT_DIR"

if [ -x "$WORKSPACE_NODE/node" ]; then
  export PATH="$WORKSPACE_NODE:$PATH"
fi

if lsof -iTCP:"$PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  echo "今天吃什么已经在运行：$URL"
  open "$URL"
  echo
  echo "可以关闭这个窗口。"
  sleep 3
  exit 0
fi

echo "正在启动今天吃什么..."
echo "项目目录：$PROJECT_DIR"
echo "访问地址：$URL"
echo

open "$URL"
npm run dev -- --port "$PORT"
