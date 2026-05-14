# 今天吃什么现有项目规格

## 1. 文档目标

本文档把当前项目整理成可交付给 uni-app 重写团队的规格说明。后续重写时以本文档描述的产品规则、数据结构、页面流程和验收标准为准，而不是逐行照搬当前 Next.js 或微信原生小程序代码。

当前项目名称：今天吃什么。产品定位是面向深圳家庭的买菜做饭助手，帮助用户从“今晚不知道吃什么”直接走到“买什么、做什么、怎么做、几点开始做”。

## 2. 当前技术现状

- Web 端：Next.js 14 App Router + React 18 + TypeScript。
- Web 页面入口：`app/page.tsx`、`app/result/page.tsx`、`app/result/PlanSwitcher.tsx`。
- Web API：`app/api/meal-plans/generate/route.ts`、`app/api/dish-likes/route.ts`。
- 业务核心：`lib/homeDishes.ts`、`lib/mockPlans.ts`、`lib/types.ts`、`lib/resultUrl.ts`、`lib/planSelection.ts`。
- 数据源：`data/*.json` 全量迁移，核心包括 `dishes.seed.json`、`ingredients.seed.json`、`nutrition.seed.json`、`season-shenzhen.json`、`price-baseline.json`、`platform-keywords.json`、`data-sources.json`。
- 数据生成脚本：`scripts/build-food-data.cjs` 是当前数据生成链路的维护入口；`legacy/miniprogram-native/utils/curatedData.js` 是旧原生小程序使用的生成产物，不应作为新项目唯一真相源。
- 微信小程序当前主线：`food-uniapp/`。旧原生版本已迁移到 `legacy/miniprogram-native/`，只作为迁移参考。
- 当前菜品库规模：302 道菜，165 个食材。
- 当前菜品分类：蛋类、荤菜、汤、素菜、豆腐、主食、凉菜、蒸菜。
- 当前主要菜系标签：家常菜、广东家常。

## 3. 产品原则

- 首页不再让用户填复杂问卷，优先让用户点选“想吃的菜”。
- 用户可以搜索、收藏、刷新菜品，快速凑出今晚想吃的菜单。
- 生成结果必须包含买菜清单、做饭顺序、按点上桌计划、每道菜详细做法。
- 首页选菜可以作为生成输入，但最终验收以“菜单生成、买菜清单、做法步骤都来自迁移数据”为准。
- 每次最多呈现三套方案，避免选择过载。
- 深圳家庭场景优先：3 人、80 元、晚餐、菜市场、18:30 前做好、慢一点做饭是当前默认倾向。
- Web 和小程序可以有不同 UI，但同一业务规则必须一致。

## 4. 用户与场景

核心用户：

- 家庭做饭负责人。
- 宝妈、姐姐、年轻家庭、情侣同居用户。
- 新手做饭用户。
- 下班后临时买菜做饭的人。
- 家里有孩子或老人，需要清淡、软烂、少辣菜单的人。
- 深圳本地或深圳生活方式接近的家庭。

核心问题：

- 不知道今晚买什么。
- 不知道几道菜怎么搭成一桌饭。
- 不知道每道菜买多少。
- 不知道多道菜如何安排先后顺序。
- 不知道孩子、老人、预算、时间限制下如何取舍。

## 5. 页面地图

uni-app v1 应至少包含以下页面：

- 首页：点选菜品、搜索、收藏、刷新、生成菜谱。
- 结果页：三套方案切换、买菜清单、按点上桌、做饭顺序、每道菜做法、记住本桌、换一桌、改条件。
- 可选后续页：收藏菜列表、历史菜单列表、设置页。

当前版本不要求保留复杂注册登录流程。用户标识可先用本地匿名 ID 或平台 openid 适配层。

## 6. 首页规格

### 6.1 默认状态

首页默认展示 12 道菜。默认菜名：

```text
番茄炒蛋
土豆焖鸡
清蒸鲈鱼
蒜蓉菜心
肉末蒸蛋
番茄牛肉
紫菜蛋花汤
虾仁滑蛋
白灼芥兰
丝瓜蛋花汤
玉米胡萝卜排骨汤
家常豆腐
```

默认选中前 4 道菜：

```text
番茄炒蛋
土豆焖鸡
清蒸鲈鱼
蒜蓉菜心
```

首页底部提交区显示：

- 有选中菜时：`已选 N 道`。
- 无选中菜时：`先选一道菜`，生成按钮不可继续生成或点击后提示。
- 摘要只显示前两道菜，超过两道显示“等 N 道”。

### 6.2 菜品行

每道菜至少显示：

- 选中状态：已选 / 可选。
- 菜名。
- 分类。
- 预计时间。
- 简短说明。
- 收藏按钮。
- Web 端当前还显示点赞按钮和今日点赞次数；uni-app 多端 v1 可先降级为收藏，点赞作为 Web/服务端增强项。

### 6.3 选择规则

- 点击菜品主区域切换选中状态。
- 最多保留 12 道选中菜。
- 允许取消到 0 道，但生成时必须阻止并提示。
- 选中菜持久化到本地。
- 刷新菜品时，已选菜保持不变，未选位置从菜池中轮换补齐。

### 6.4 搜索规则

搜索入口默认收起，点击后展开输入框。

搜索范围：

- 无搜索词时，只在当前可见的 12 道菜中展示。
- 有搜索词时，搜索完整菜库。
- 收藏 Tab 下搜索时，只在收藏菜中搜索。

搜索关键词来源：

- 菜名。
- 分类。
- 菜系。
- 首页简短说明。
- 口味。
- 主食材。
- 可选食材。
- 地域风格。
- 适合人群。
- 做法。
- 忌口标签。

搜索匹配规则：

- 去除空白并转小写。
- 支持多个词，按空格拆分。
- 所有词都必须命中某个关键词。
- 任一关键词包含搜索词即可命中。

空状态：

- 全部 Tab 搜不到：标题 `没找到这道菜`，说明 `换个菜名、分类或口味试试，比如“汤”“快手”“番茄”。`
- 收藏 Tab 为空：标题 `还没有收藏`，说明 `看到常吃的菜，点收藏，下次会在这里出现。`

### 6.5 收藏规则

- 收藏是本地行为，先不要求服务端同步。
- 收藏列表可为空。
- 收藏菜必须能从“收藏”筛选中看到。
- 取消收藏后从收藏筛选中移除。

### 6.6 本地存储键

当前逻辑使用的键名如下，uni-app 可以沿用，便于迁移用户数据：

```text
san-zhuo-cai:home-selected-dishes
san-zhuo-cai:home-visible-dishes
san-zhuo-cai:home-saved-dishes
san-zhuo-cai:last-form
san-zhuo-cai:last-choice
san-zhuo-cai:dish-engagement
san-zhuo-cai:home-user-id
```

多平台实现时用 `uni.getStorageSync` / `uni.setStorageSync` 封装，不要在业务代码里直接写平台专用 API。

## 7. 生成请求规格

生成请求使用统一结构：

```ts
type GenerateRequest = {
  city: string;
  people_count: number;
  has_child?: boolean;
  has_elder?: boolean;
  budget: number;
  meal_type: "早餐" | "午餐" | "晚餐";
  taste: string[];
  avoid: string[];
  time_limit: number;
  finish_time?: string;
  cook_speed?: "normal" | "slow" | "beginner";
  variant?: number;
  user_id?: string;
  favorite_foods?: string[];
  selected_dishes?: string[];
  recommendation_date?: string;
  shopping_channel: string;
  kitchen_tools: string[];
};
```

当前首页生成时默认请求值：

```json
{
  "city": "深圳",
  "people_count": 3,
  "has_child": true,
  "has_elder": false,
  "budget": 80,
  "meal_type": "晚餐",
  "taste": ["清淡", "不辣"],
  "avoid": [],
  "time_limit": 40,
  "finish_time": "18:30",
  "cook_speed": "slow",
  "shopping_channel": "菜市场",
  "kitchen_tools": ["炒锅", "电饭锅"]
}
```

生成时必须把首页选中菜同时写入：

- `selected_dishes`
- `favorite_foods`

其中 `selected_dishes` 作为生成输入传递给结果页；`favorite_foods` 保留给旧逻辑兼容。uni-app v1 的硬验收要求第一套方案的菜品顺序等于首页选中菜顺序中能在迁移菜库命中的菜，并且菜单生成、买菜清单、做法步骤都来自迁移后的真实数据。

## 8. 结果页规格

### 8.1 结果页入口参数

Web 当前最小链接参数：

```text
/result?selectedDishes=番茄炒蛋,土豆焖鸡&variant=123
```

小程序当前完整参数：

```text
/pages/result/result?selectedDishes=番茄炒蛋,土豆焖鸡&people=3&family=child&budget=80&time=40&taste=清淡,不辣&channel=菜市场&avoid=&finishTime=18:30&cookSpeed=slow&favoriteFoods=番茄炒蛋,土豆焖鸡&variant=123
```

uni-app 重写时建议统一为页面 query 解析 + 内部 `GenerateRequest`，不要让页面直接依赖零散字段。

### 8.2 结果页展示

结果页必须展示：

- 标题：今天吃什么。
- 副标题：若有首页选菜，显示 `按首页已选 N 道生成`；否则显示 `N 人 · 约 X 元 · Y 分钟`。
- 若有选中菜，展示“这次围绕”条，列出选中菜。
- 今日推荐买。
- 今天不太推荐及原因。
- 三套方案 Tab。
- 当前方案卡片。

每套方案卡片必须包含：

- 方案类型。
- 预计花费。
- 预计耗时。
- 菜品数量。
- 方案理由。
- 菜单列表。
- 买菜清单。
- 按点上桌计划。
- 做饭顺序。
- 每道菜做法。
- 每道菜技巧。

### 8.3 结果页操作

- `就用这桌`：保存当前方案到本地 `san-zhuo-cai:last-choice`。
- `换一桌`：`variant + 1` 后重新生成。
- `改条件`：返回首页或跳转首页。
- Web 增强操作：复制文字、复制 HTML、复制分享链接。

uni-app v1 对复制能力建议：

- H5 支持复制文字和分享链接。
- 小程序支持复制文字和页面分享。
- 不强制支持复制 HTML，因为多端剪贴板富文本兼容性差。

## 9. 方案生成规则

### 9.1 输出结构

```ts
type MealPlan = {
  type: "省钱快手型" | "营养均衡型" | "孩子老人友好型" | "改善伙食型";
  title: string;
  estimated_cost: number;
  total_time: number;
  suitable_for: string[];
  dishes: DishInPlan[];
  shopping_list: ShoppingGroup[];
  cooking_order: string[];
  finish_time?: string;
  cook_speed?: "normal" | "slow" | "beginner";
  cooking_schedule?: { time: string; task: string }[];
  replacement_suggestions?: { old: string; new_options: string[] }[];
  reason: string;
};
```

### 9.2 三套方案规则

- 没有首页选菜时，生成三套：
  - 省钱快手型。
  - 营养均衡型。
  - 如果有孩子或老人，第三套为孩子老人友好型；否则为改善伙食型。
- 有首页选菜时，可以把选中菜作为生成输入，但不要把页面选中菜写死成结果页唯一来源。
- 方案标题、理由、菜品、买菜清单和做法步骤都必须从迁移数据和生成规则推导。

### 9.3 选菜算法要求

系统推荐方案按以下因素评分：

- 做饭时间小于等于用户时间限制加分。
- 省钱快手型偏好低成本。
- 营养均衡型偏好中等成本、有荤有素有汤。
- 改善伙食型在预算足够时偏好高成本或更有满足感的菜。
- 有孩子时偏好 `kid_friendly`。
- 有老人时偏好 `elder_friendly`。
- 口味命中用户 taste 加分。
- 广东家常加分。
- 当季食材加分。
- 当前价格便宜加分，偏贵或很贵扣分。
- 忌口命中时排除。
- 同一轮三套方案避免重复菜名。

### 9.4 买菜清单规则

- 买菜清单来自菜品的 `shopping_amount_for_3_people`。
- 按食材分类分组，分类来自 `data/ingredients.seed.json`。
- 同一组内同名食材去重。
- v1 不要求自动按人数换算克数，但后续要预留人数换算能力。

### 9.5 做饭计划规则

- 默认完成时间：`12:00`；首页新版默认 `18:30`。
- 做饭速度缓冲：
  - `normal`：0 分钟。
  - `slow`：10 分钟。
  - `beginner`：20 分钟。
- 按点上桌计划生成 4 到 6 个节点。
- 最后一个节点固定为完成时间，任务为 `完成收尾，上桌开饭`。
- 计划开始时间 = 完成时间 - 方案总耗时 - 做饭速度缓冲。

### 9.6 初始推荐方案 Tab

- URL 有合法 `planIndex` 时优先使用。
- 预算大于等于 150 时，优先展示改善伙食型；没有改善伙食型时展示预计花费最高的方案。
- 预算大于等于 110 时，优先展示营养均衡型。
- 其他情况展示第一套。

## 10. 数据规格

### 10.1 数据迁移要求

uni-app 重写不是空库重做，必须把当前项目数据一起迁过去。迁移范围：

- `data/dishes.seed.json`：菜品主库，当前 302 道菜，是首页菜池、搜索、菜单生成、做法步骤的核心来源。
- `data/ingredients.seed.json`：食材主库，当前 165 个食材，是买菜清单分类和平台搜索词的基础。
- `data/nutrition.seed.json`：营养参考数据，v1 可以不展示，但必须迁移保留，给后续营养解释使用。
- `data/season-shenzhen.json`：深圳时令数据，用于当季食材加分。
- `data/price-baseline.json`：价格基线，用于便宜/偏贵/很贵评分。
- `data/platform-keywords.json`：买菜平台关键词，后续做朴朴、盒马、美团买菜等搜索词时使用。
- `data/data-sources.json`：数据来源记录，迁移后继续保留，方便以后审计数据从哪里来。
- `scripts/build-food-data.cjs`：数据构建脚本，迁移时要么复制为新项目脚本，要么把其逻辑改写成 uni-app 项目的数据构建脚本。

迁移原则：

- 业务代码读取 `src/data/*.json` 或构建后的 typed data，不要重新手写一份菜库。
- 如果继续需要小程序专用轻量数据文件，可以生成 `src/data/curatedData.ts`，但必须由脚本生成，不允许手工维护两份菜库。
- 数据字段缺失时先修源数据或构建脚本，不要在页面层硬编码补丁。
- 迁移后要用脚本校验菜品数量、食材数量、默认 12 道菜是否存在、首页搜索是否能命中完整菜库。

### 10.2 Dish

```ts
type Dish = {
  dish_name: string;
  category: "荤菜" | "素菜" | "汤" | "蛋类" | "豆腐" | "主食" | "凉菜" | "蒸菜";
  cuisine: "广东家常" | "川湘" | "家常菜" | "减脂" | "儿童" | "全国通用";
  region_style?: string[];
  suitable_people?: string[];
  meal_type?: ("早餐" | "午餐" | "晚餐")[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  time_minutes: number;
  taste: string[];
  main_ingredients: string[];
  optional_ingredients?: string[];
  season?: (string | number)[];
  tools?: string[];
  cooking_methods?: string[];
  estimated_cost_level: "低" | "中" | "高";
  kid_friendly: boolean;
  elder_friendly: boolean;
  avoid_tags?: string[];
  steps: string[];
  shopping_amount_for_3_people?: { name: string; amount: string }[];
};
```

### 10.3 Ingredient

```ts
type Ingredient = {
  standard_name: string;
  aliases: string[];
  category: string;
  common_units: string[];
  storage_days: number;
  season_months: number[];
  platform_keywords: {
    朴朴?: string[];
    沃尔玛?: string[];
    盒马?: string[];
    菜市场?: string[];
    美团买菜?: string[];
    楼下超市?: string[];
  };
};
```

## 11. 多端差异策略

通用层必须一致：

- 菜池数据。
- 首页搜索逻辑。
- 已选菜规范化。
- 刷新未选菜。
- 生成请求结构。
- 三套方案规则。
- 结果页参数解析。
- 方案初始 Tab 选择。

平台层允许差异：

- H5 可复制 HTML，小程序不强制。
- Web 可显示点赞，小程序 v1 可不显示或后续通过云函数支持。
- 小程序分享走平台分享能力，H5 分享走 URL。
- App 端可把历史菜单做成本地页面，H5 可先不做。

## 12. uni-app 重写边界

v1 必须做：

- 首页选菜、搜索、收藏、刷新。
- 结果页三套方案展示。
- 换一桌、改条件、记住本桌。
- 本地持久化。
- H5 和微信小程序两端可运行。

v1 不必须做：

- Supabase 登录。
- 真实 DeepSeek 动态生成。
- 跨设备同步收藏。
- 复制 HTML。
- 点赞排行榜。
- 后台管理系统。

## 13. 验收标准

以下验收标准是 uni-app 重写的准入口径；未列入本节的能力可以作为实现细节或后续增强，但不能反过来覆盖本节。

- `src/data/` 中存在当前 `data/` 的全量迁移文件。
- 迁移后菜品数量仍为 302，食材数量仍为 165。
- 默认 12 道首页菜全部能在迁移后的菜库中找到。
- 搜索使用迁移后的完整菜库，而不是只使用页面写死数据。
- 菜单生成、买菜清单、做法步骤都来自迁移数据。
- 收藏一道菜后，切到收藏 Tab 能看到；取消收藏后消失。
- 点击刷新后，已选菜仍保留，未选菜发生变化。
- 未选任何菜时不能生成，必须提示。
- 生成结果后，结果页显示“按首页已选 N 道生成”。
- 第一套方案的菜品顺序等于首页选中菜顺序中能在菜库命中的菜。
- 点击换一桌后 `variant` 增加并重新生成。
- 点击就用这桌后，再回首页能看到上次选择入口。
- H5 和微信小程序至少各跑通首页到结果页完整流程。
