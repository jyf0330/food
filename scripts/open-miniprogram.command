#!/bin/zsh

set -e

PROJECT_DIR="/Users/macminim4/Documents/New project/food"
DEVTOOLS_APP="/Applications/wechatwebdevtools.app"
DEVTOOLS_CLI="$DEVTOOLS_APP/Contents/MacOS/cli"

echo "正在打开今天吃什么微信小程序..."
echo "项目目录：$PROJECT_DIR"
echo

if [ -x "$DEVTOOLS_CLI" ]; then
  printf "y\n" | "$DEVTOOLS_CLI" open --project "$PROJECT_DIR"
  exit 0
fi

if [ -d "$DEVTOOLS_APP" ]; then
  open -a "$DEVTOOLS_APP" "$PROJECT_DIR"
  exit 0
fi

echo "没有找到微信开发者工具。"
echo "请安装后在开发者工具里导入这个目录："
echo "$PROJECT_DIR"
open "$PROJECT_DIR"
read -n 1 -s "?按任意键关闭..."
