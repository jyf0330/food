# AGENTS.md

本文件是本项目给 Codex / coding agent 的工作规则。

## 项目概况

- 项目名称：今天吃什么
- 技术栈：Next.js 14 App Router + React 18 + TypeScript
- Web 入口：`app/`
- 小程序入口：`miniprogram/`
- 主要业务逻辑：`lib/`
- 数据种子：`data/`

## 常用命令

```bash
npm run typecheck
npm test
npm run build
```

本地 macOS 上 `npm run build` 可能遇到 Next SWC 二进制签名问题；如果代码检查和测试通过，可在 Linux 服务器上重新安装依赖并构建验证。

## 工作原则

- 需求不清时先说明假设；影响行为的假设不要静默决定。
- 优先做能解决问题的最小改动，不加投机性抽象和未使用配置。
- 只改任务需要的文件和代码；不要顺手重构无关区域。
- 匹配现有目录结构、命名和代码风格，再考虑新模式。
- 每个有意义的改动都要有可复现验证：测试、类型检查、构建或手动检查路径。

## 服务器连接

连接云服务器前，先阅读：

```bash
docs/SERVER_SSH.md
```

当前服务器连接命令：

```bash
ssh -i /Users/macminim4/Desktop/agar.pem ubuntu@124.222.83.113
```

不要把私钥内容写进仓库。仓库里只允许记录私钥路径和连接方式。

## 当前线上部署

- 服务器项目目录：`/home/ubuntu/apps/food`
- 公网访问：`http://124.222.83.113/`
- pm2 服务名：`food`
- 服务端口：`3001`
- nginx `80` 端口代理到 `http://127.0.0.1:3001`

服务器维护常用命令：

```bash
cd /home/ubuntu/apps/food
pm2 list
pm2 logs food
pm2 restart food
```

## 部署注意事项

- 旧服务 `agar-io-clone` 仍在服务器 `3000` 端口运行，不要删除或停止，除非用户明确要求。
- 更新线上代码时，避免同步 `node_modules/`、`.next/`、`.env*`、私钥文件和本地缓存。
- 修改 nginx 前先备份配置，并执行 `sudo nginx -t`，通过后再 reload。
- 如果代码已经推送到 Git，并且用户期待线上也更新，必须同步执行云端部署/更新步骤；不要把 `git push` 当作交付终点。
- 改动完成后至少验证公网首页和接口：

```bash
curl -I http://124.222.83.113/
curl -s -X POST http://124.222.83.113/api/meal-plans/generate \
  -H 'content-type: application/json' \
  -d '{}'
```

## Git 规则

- 非小型改动优先使用短生命周期分支：`feature/<topic>`、`fix/<topic>`、`refactor/<topic>`、`docs/<topic>`、`chore/<topic>`。
- 每个提交只表达一个关注点，避免把功能、重构、文档和格式化混在一起。
- 提交信息使用清晰的动词式描述，例如：`feat: add meal history`、`fix: prevent empty budget submission`、`docs: add server ssh notes`。
- 提交前运行能证明本次改动正确的最小验证命令。
- 不要提交密钥、token、`.env` 内容、生产凭据或本地缓存文件。

## 代码规则

- 优先保持现有目录结构和轻量实现，不做无关重构。
- TypeScript 改动后运行 `npm run typecheck`。
- 业务生成逻辑改动后运行 `npm test`。
- UI 或路由改动后尽量运行 `npm run build`；若本地 SWC 问题导致失败，需要说明失败原因，并在服务器 Linux 环境验证。

## 文档规则

- 行为、启动方式、部署方式、服务器路径或开发流程变化时，同步更新相关文档。
- 服务器连接信息维护在 `docs/SERVER_SSH.md`，不要散落在多个文件里互相冲突。
- 文档优先写真实命令和真实路径，少写泛泛说明。

## 本地模型参考

桌面规则中记录了本机 Ollama/Hermes 环境，可用于开发期原型验证：

- Ollama API：`http://127.0.0.1:11434`
- OpenAI 兼容端点：`http://127.0.0.1:11434/v1`
- 默认本地模型：`gemma4-aggressive:latest`
- API key 占位值：`ollama`

使用前先快速检查：

```bash
curl -sS --max-time 5 http://127.0.0.1:11434/api/tags
curl -sS --max-time 5 http://127.0.0.1:11434/v1/models
```

注意：本地 Ollama 配置只适合开发和实验。生产代码不要硬编码本机模型地址、桌面路径或本地模型名；需要接入大模型时，优先通过环境变量配置。
