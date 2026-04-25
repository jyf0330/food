# 今天吃什么

> 帮你想好买什么、做什么、怎么做。

面向深圳家庭的 AI 买菜做饭助手 MVP 脚手架。用户输入家庭情况（几口人、预算、忌口、时间、买菜渠道），系统生成三套完整晚餐方案：菜单、买菜清单、做饭顺序、详细做法、替换建议。

完整产品文档见 [`docs/PRD.md`](./docs/PRD.md)。

---

## 技术栈

- **前端**：Next.js 14 (App Router) + TypeScript + React 18
- **后端**：Next.js Route Handlers（`/app/api`）
- **数据库**：Supabase (Postgres)
- **大模型**：DeepSeek / 通义千问 / 腾讯混元（任选）
- **数据**：菜品库 + 食材库 + 深圳时令表 + 去年同期价格基线（种子文件见 `data/`）

---

## 目录结构

```text
food/
├── app/                    Next.js App Router 页面
│   ├── layout.tsx
│   ├── page.tsx            首页表单（输入家庭情况）
│   ├── result/page.tsx     结果页（展示吃什么方案）
│   └── globals.css
├── lib/
│   ├── types.ts            Dish / Ingredient / MealPlan 类型
│   ├── supabase.ts         Supabase 客户端
│   └── mockPlans.ts        Mock 吃什么方案数据（离线可跑）
├── data/                   种子 JSON（大模型批量生成的 ingest 起点）
│   ├── dishes.seed.json
│   ├── ingredients.seed.json
│   ├── season-shenzhen.json
│   └── platform-keywords.json
├── supabase/
│   └── schema.sql          12 张表的 DDL
├── docs/
│   └── PRD.md              完整产品 Wiki
└── package.json
```

---

## 快速开始

```bash
cd "/Users/macminim4/Documents/New project/food"

# 1. 安装依赖
npm install

# 2. 配置环境变量（可选，先 mock 数据即可跑）
cp .env.example .env.local

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

> 当前首页表单 → 结果页走 **mock 数据**，不依赖 Supabase 和大模型 API。
> 跑通 UI 后再按 `docs/PRD.md` 第 13-17 节接入数据库和大模型。

---

## Supabase 初始化

```bash
# 在 Supabase 控制台的 SQL Editor 里执行
cat supabase/schema.sql | pbcopy
```

然后用 `data/*.seed.json` 做首次导入（脚本待补）。

---

## 下一步 TODO

- [ ] 接 DeepSeek / 通义千问 API，实现 `/api/meal-plans/generate`
- [ ] 把 `data/*.seed.json` 扩展到 300 道菜 + 200 个食材（大模型批量生成 + 人工校验）
- [ ] 补充去年同期价格基线数据（`historical_ingredient_baseline`）
- [ ] 做"今日推荐食材池"每日生成任务
- [ ] 买菜清单按平台搜索词渲染
- [ ] 做饭顺序页
- [ ] 用户反馈收集
- [ ] 微信小程序版本

---

## License

私有项目，暂未开源。
