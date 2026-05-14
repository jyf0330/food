# Uni App Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new uni-app version of 今天吃什么 from the current product spec, targeting H5 and WeChat Mini Program first.

**Architecture:** Keep business rules in platform-neutral TypeScript modules under `src/domain/`, and keep page files thin. Use uni-app storage/navigation adapters so H5 and mini-program pages call the same domain functions.

**Tech Stack:** uni-app + Vue 3 + TypeScript + Vite, local JSON seed data, `uni.getStorageSync` / `uni.setStorageSync`, H5 and WeChat Mini Program builds.

---

## 1. Target File Structure

Create a new uni-app project instead of editing the current Next.js app in place. Recommended directory:

```text
food-uniapp/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── manifest.json
│   ├── pages.json
│   ├── pages/
│   │   ├── index/index.vue
│   │   └── result/result.vue
│   ├── domain/
│   │   ├── types.ts
│   │   ├── homeDishes.ts
│   │   ├── mealPlans.ts
│   │   ├── resultUrl.ts
│   │   ├── planSelection.ts
│   │   └── storageKeys.ts
│   ├── data/
│   │   ├── dishes.seed.json
│   │   ├── ingredients.seed.json
│   │   ├── nutrition.seed.json
│   │   ├── season-shenzhen.json
│   │   ├── price-baseline.json
│   │   ├── platform-keywords.json
│   │   └── data-sources.json
│   ├── adapters/
│   │   ├── storage.ts
│   │   └── navigation.ts
│   └── tests/
│       ├── homeDishes.test.ts
│       ├── mealPlans.test.ts
│       ├── resultUrl.test.ts
│       └── planSelection.test.ts
```

## 2. Domain Contracts

Copy and adapt these data contracts from the current project before building pages:

```ts
export type DishCategory =
  | "荤菜"
  | "素菜"
  | "汤"
  | "蛋类"
  | "豆腐"
  | "主食"
  | "凉菜"
  | "蒸菜";

export type GenerateRequest = {
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

export type MealPlan = {
  type: "省钱快手型" | "营养均衡型" | "孩子老人友好型" | "改善伙食型";
  title: string;
  estimated_cost: number;
  total_time: number;
  suitable_for: string[];
  dishes: {
    name: string;
    category?: DishCategory;
    reason: string;
    ingredients?: { name: string; amount: string }[];
    steps?: string[];
    tips?: string[];
  }[];
  shopping_list: {
    category: string;
    items: { name: string; amount: string; search_keywords?: string[] }[];
  }[];
  cooking_order: string[];
  finish_time?: string;
  cook_speed?: GenerateRequest["cook_speed"];
  cooking_schedule?: { time: string; task: string }[];
  reason: string;
};
```

## 3. Tasks

### Task 1: Scaffold uni-app Project

**Files:**
- Create: `food-uniapp/package.json`
- Create: `food-uniapp/src/main.ts`
- Create: `food-uniapp/src/App.vue`
- Create: `food-uniapp/src/pages.json`
- Create: `food-uniapp/src/manifest.json`

- [ ] **Step 1: Create the project with Vue 3 + TypeScript**

Run:

```bash
npx degit dcloudio/uni-preset-vue#vite-ts food-uniapp
cd food-uniapp
npm install
```

Expected: `food-uniapp` exists and `npm install` exits with code 0.

- [ ] **Step 2: Configure the two required pages**

Write `src/pages.json`:

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "今天吃什么",
        "navigationBarBackgroundColor": "#fff8f2",
        "navigationBarTextStyle": "black"
      }
    },
    {
      "path": "pages/result/result",
      "style": {
        "navigationBarTitleText": "今天吃什么",
        "navigationBarBackgroundColor": "#fff8f2",
        "navigationBarTextStyle": "black"
      }
    }
  ],
  "globalStyle": {
    "backgroundColor": "#fff8f2",
    "navigationBarTitleText": "今天吃什么",
    "navigationBarBackgroundColor": "#fff8f2",
    "navigationBarTextStyle": "black"
  }
}
```

- [ ] **Step 3: Commit scaffold**

Run:

```bash
git add food-uniapp
git commit -m "Start uni-app rebuild from product spec

Constraint: Keep the existing Next.js and native mini-program projects untouched during scaffold.
Confidence: high
Scope-risk: narrow
Tested: npm install
Not-tested: H5 and mini-program runtime not implemented yet"
```

### Task 2: Port Seed Data and Types

**Files:**
- Create: `food-uniapp/src/data/dishes.seed.json`
- Create: `food-uniapp/src/data/ingredients.seed.json`
- Create: `food-uniapp/src/data/nutrition.seed.json`
- Create: `food-uniapp/src/data/season-shenzhen.json`
- Create: `food-uniapp/src/data/price-baseline.json`
- Create: `food-uniapp/src/data/platform-keywords.json`
- Create: `food-uniapp/src/data/data-sources.json`
- Create: `food-uniapp/scripts/verify-data.mjs`
- Create: `food-uniapp/src/domain/types.ts`

- [ ] **Step 1: Copy seed data**

Run from the current project root:

```bash
cp data/dishes.seed.json food-uniapp/src/data/dishes.seed.json
cp data/ingredients.seed.json food-uniapp/src/data/ingredients.seed.json
cp data/nutrition.seed.json food-uniapp/src/data/nutrition.seed.json
cp data/season-shenzhen.json food-uniapp/src/data/season-shenzhen.json
cp data/price-baseline.json food-uniapp/src/data/price-baseline.json
cp data/platform-keywords.json food-uniapp/src/data/platform-keywords.json
cp data/data-sources.json food-uniapp/src/data/data-sources.json
```

Expected: copied JSON files match current source files. Do not recreate or shrink the catalog during the uni-app rewrite.

- [ ] **Step 2: Add domain types**

Write `food-uniapp/src/domain/types.ts` using the contracts from section 2.

- [ ] **Step 3: Add data verification script**

Create `food-uniapp/scripts/verify-data.mjs`:

```js
import { readFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const dishes = readJson("../src/data/dishes.seed.json");
const ingredients = readJson("../src/data/ingredients.seed.json");
const requiredHomeDishes = [
  "番茄炒蛋",
  "土豆焖鸡",
  "清蒸鲈鱼",
  "蒜蓉菜心",
  "肉末蒸蛋",
  "番茄牛肉",
  "紫菜蛋花汤",
  "虾仁滑蛋",
  "白灼芥兰",
  "丝瓜蛋花汤",
  "玉米胡萝卜排骨汤",
  "家常豆腐",
];

const dishNames = new Set(dishes.map((dish) => dish.dish_name));
const missing = requiredHomeDishes.filter((name) => !dishNames.has(name));

if (dishes.length !== 302) {
  throw new Error(`Expected 302 dishes, got ${dishes.length}`);
}

if (ingredients.length !== 165) {
  throw new Error(`Expected 165 ingredients, got ${ingredients.length}`);
}

if (missing.length) {
  throw new Error(`Missing default home dishes: ${missing.join(", ")}`);
}

console.log("Data migration verified: 302 dishes, 165 ingredients, 12 default dishes present.");
```

- [ ] **Step 4: Add package script**

Add this script to `food-uniapp/package.json`:

```json
{
  "scripts": {
    "verify:data": "node scripts/verify-data.mjs"
  }
}
```

- [ ] **Step 5: Add JSON import support**

Verify `food-uniapp/tsconfig.json` has:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 6: Run data verification**

Run:

```bash
cd food-uniapp
npm run verify:data
```

Expected:

```text
Data migration verified: 302 dishes, 165 ingredients, 12 default dishes present.
```

- [ ] **Step 7: Commit data and types**

Run:

```bash
git add food-uniapp/src/data food-uniapp/src/domain/types.ts food-uniapp/scripts/verify-data.mjs food-uniapp/package.json food-uniapp/tsconfig.json
git commit -m "Define uni-app meal data contracts

Constraint: Seed data must be migrated from the current project without shrinking the 302-dish catalog or 165-ingredient list.
Confidence: high
Scope-risk: narrow
Tested: npm run verify:data; JSON files copied; TypeScript JSON imports configured
Not-tested: Meal generation not ported yet"
```

### Task 3: Implement Homepage Dish Domain

**Files:**
- Create: `food-uniapp/src/domain/homeDishes.ts`
- Create: `food-uniapp/src/domain/storageKeys.ts`
- Create: `food-uniapp/src/tests/homeDishes.test.ts`

- [ ] **Step 1: Write tests for default, search, normalize, refresh**

Create `food-uniapp/src/tests/homeDishes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_POOL,
  homeDishesFromNames,
  normalizeHomeDishNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes,
} from "../domain/homeDishes";

describe("homeDishes", () => {
  it("starts with 12 default dishes", () => {
    expect(DEFAULT_HOME_DISH_NAMES).toHaveLength(12);
    expect(DEFAULT_HOME_DISH_NAMES.slice(0, 4)).toEqual([
      "番茄炒蛋",
      "土豆焖鸡",
      "清蒸鲈鱼",
      "蒜蓉菜心",
    ]);
  });

  it("searches the full dish pool with all-token matching", () => {
    const result = searchHomeDishes(HOME_DISH_POOL, "鸡蛋 汤");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((dish) => dish.searchKeywords.join(" ").includes("鸡蛋"))).toBe(true);
    expect(result.every((dish) => dish.searchKeywords.join(" ").includes("汤"))).toBe(true);
  });

  it("normalizes stored names and drops unknown dishes", () => {
    expect(normalizeHomeDishNames(["番茄炒蛋", "不存在", "番茄炒蛋"], ["家常豆腐"])).toEqual([
      "番茄炒蛋",
    ]);
  });

  it("refreshes only unselected visible dishes", () => {
    const current = DEFAULT_HOME_DISH_NAMES;
    const selected = current.slice(0, 2);
    const next = refreshUnselectedHomeDishes(current, selected, 8);
    expect(next.slice(0, 2)).toEqual(selected);
    expect(next).toHaveLength(current.length);
    expect(new Set(next).size).toBe(next.length);
  });

  it("maps names to home dish view models", () => {
    const dishes = homeDishesFromNames(["番茄炒蛋", "不存在"]);
    expect(dishes).toHaveLength(1);
    expect(dishes[0].name).toBe("番茄炒蛋");
  });
});
```

- [ ] **Step 2: Implement storage keys**

Create `food-uniapp/src/domain/storageKeys.ts`:

```ts
export const SELECTED_DISHES_KEY = "san-zhuo-cai:home-selected-dishes";
export const VISIBLE_DISHES_KEY = "san-zhuo-cai:home-visible-dishes";
export const SAVED_DISHES_KEY = "san-zhuo-cai:home-saved-dishes";
export const LAST_FORM_KEY = "san-zhuo-cai:last-form";
export const LAST_CHOICE_KEY = "san-zhuo-cai:last-choice";
```

- [ ] **Step 3: Implement home dish logic**

Port the current `lib/homeDishes.ts` behavior into `food-uniapp/src/domain/homeDishes.ts`. Keep these exact exports:

```ts
export const DEFAULT_HOME_DISH_NAMES: string[];
export const HOME_DISH_POOL: HomeDish[];
export function homeDishesFromNames(names: string[]): HomeDish[];
export function normalizeHomeDishNames(
  value: unknown,
  fallback: string[],
  options?: { allowEmpty?: boolean; limit?: number }
): string[];
export function searchHomeDishes(dishes: HomeDish[], query: string): HomeDish[];
export function refreshUnselectedHomeDishes(
  currentNames: string[],
  selectedNames: string[],
  seed: number
): string[];
```

- [ ] **Step 4: Run tests**

Run:

```bash
cd food-uniapp
npm install -D vitest
npx vitest run src/tests/homeDishes.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit domain logic**

Run:

```bash
git add food-uniapp/src/domain/homeDishes.ts food-uniapp/src/domain/storageKeys.ts food-uniapp/src/tests/homeDishes.test.ts food-uniapp/package.json food-uniapp/package-lock.json
git commit -m "Port home dish rules to uni-app domain

Constraint: Search must use the full dish pool when a query is present.
Rejected: Page-local search implementation | It would make H5 and mini-program drift.
Confidence: high
Scope-risk: narrow
Tested: npx vitest run src/tests/homeDishes.test.ts
Not-tested: Page UI not wired yet"
```

### Task 4: Implement Meal Plan Domain

**Files:**
- Create: `food-uniapp/src/domain/mealPlans.ts`
- Create: `food-uniapp/src/domain/planSelection.ts`
- Create: `food-uniapp/src/tests/mealPlans.test.ts`
- Create: `food-uniapp/src/tests/planSelection.test.ts`

- [ ] **Step 1: Write selected-dish generation test**

Create `food-uniapp/src/tests/mealPlans.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildGenerateResponse } from "../domain/mealPlans";
import type { GenerateRequest } from "../domain/types";

const baseRequest: GenerateRequest = {
  city: "深圳",
  people_count: 3,
  has_child: true,
  has_elder: false,
  budget: 80,
  meal_type: "晚餐",
  taste: ["清淡", "不辣"],
  avoid: [],
  time_limit: 40,
  finish_time: "18:30",
  cook_speed: "slow",
  shopping_channel: "菜市场",
  kitchen_tools: ["炒锅", "电饭锅"],
};

describe("mealPlans", () => {
  it("uses selected home page dishes for the first generated plan", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      selected_dishes: ["番茄炒蛋", "蒜蓉菜心", "紫菜蛋花汤"],
    });

    expect(response.plans[0].type).toBe("营养均衡型");
    expect(response.plans[0].dishes.map((dish) => dish.name)).toEqual([
      "番茄炒蛋",
      "蒜蓉菜心",
      "紫菜蛋花汤",
    ]);
    expect(response.plans[0].reason).toMatch(/首页选的 3 道菜/);
  });

  it("builds three plans when no dishes are selected", () => {
    const response = buildGenerateResponse(baseRequest);
    expect(response.plans).toHaveLength(3);
    expect(response.plans[0].shopping_list.length).toBeGreaterThan(0);
    expect(response.plans[0].cooking_schedule?.at(-1)?.task).toBe("完成收尾，上桌开饭");
  });
});
```

- [ ] **Step 2: Write plan selection tests**

Create `food-uniapp/src/tests/planSelection.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { initialPlanIndex } from "../domain/planSelection";
import type { MealPlan } from "../domain/types";

const plan = (type: MealPlan["type"], cost: number): MealPlan => ({
  type,
  title: type,
  estimated_cost: cost,
  total_time: 30,
  suitable_for: [],
  dishes: [],
  shopping_list: [],
  cooking_order: [],
  reason: "",
});

describe("planSelection", () => {
  it("prefers explicit planIndex when valid", () => {
    expect(initialPlanIndex([plan("省钱快手型", 50), plan("营养均衡型", 80)], 80, 1)).toBe(1);
  });

  it("prefers upgrade plan for high budget", () => {
    expect(
      initialPlanIndex(
        [plan("省钱快手型", 50), plan("营养均衡型", 90), plan("改善伙食型", 160)],
        180
      )
    ).toBe(2);
  });

  it("defaults to first plan for normal budget", () => {
    expect(initialPlanIndex([plan("省钱快手型", 50), plan("营养均衡型", 90)], 80)).toBe(0);
  });
});
```

- [ ] **Step 3: Port meal generation**

Port the active logic from current `lib/mockPlans.ts` into `food-uniapp/src/domain/mealPlans.ts`. Keep these exports:

```ts
export function buildGenerateResponse(req: GenerateRequest): GenerateResponse;
```

The port must include:

- selected dish first plan.
- avoid filtering.
- cost scoring.
- seasonal and price scoring.
- child and elder friendly scoring.
- favorite-food 50% deterministic pick.
- cooking schedule.
- shopping list grouping.
- detailed recipe steps and tips.

- [ ] **Step 4: Port plan selection**

Port current `lib/planSelection.ts` into `food-uniapp/src/domain/planSelection.ts`.

- [ ] **Step 5: Run tests**

Run:

```bash
cd food-uniapp
npx vitest run src/tests/mealPlans.test.ts src/tests/planSelection.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit generation logic**

Run:

```bash
git add food-uniapp/src/domain/mealPlans.ts food-uniapp/src/domain/planSelection.ts food-uniapp/src/tests/mealPlans.test.ts food-uniapp/src/tests/planSelection.test.ts
git commit -m "Port meal generation rules to uni-app

Constraint: Homepage selected dishes must control the first plan.
Rejected: Calling the old Next.js API from v1 | Offline domain parity is faster to validate across H5 and mini-program.
Confidence: medium
Scope-risk: moderate
Tested: npx vitest run src/tests/mealPlans.test.ts src/tests/planSelection.test.ts
Not-tested: Visual result page not built yet"
```

### Task 5: Implement Navigation and Result URL Domain

**Files:**
- Create: `food-uniapp/src/domain/resultUrl.ts`
- Create: `food-uniapp/src/adapters/navigation.ts`
- Create: `food-uniapp/src/tests/resultUrl.test.ts`

- [ ] **Step 1: Write result URL tests**

Create `food-uniapp/src/tests/resultUrl.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildResultPageUrl, parseResultQuery } from "../domain/resultUrl";

describe("resultUrl", () => {
  it("round trips selected dishes and defaults", () => {
    const url = buildResultPageUrl({
      selectedDishes: ["番茄炒蛋", "紫菜蛋花汤"],
      variant: 123,
    });
    const query = url.split("?")[1];
    expect(parseResultQuery(query)).toMatchObject({
      selectedDishes: ["番茄炒蛋", "紫菜蛋花汤"],
      variant: 123,
      people: 3,
      budget: 80,
      finishTime: "18:30",
      cookSpeed: "slow",
    });
  });
});
```

- [ ] **Step 2: Implement result URL helpers**

Create `food-uniapp/src/domain/resultUrl.ts`:

```ts
export type ResultPageParams = {
  selectedDishes: string[];
  variant: number;
  people?: number;
  family?: string;
  budget?: number;
  time?: number;
  taste?: string[];
  channel?: string;
  avoid?: string[];
  finishTime?: string;
  cookSpeed?: "normal" | "slow" | "beginner";
  favoriteFoods?: string[];
  planIndex?: number;
};
```

Implement:

```ts
export function buildResultPageUrl(params: ResultPageParams): string;
export function parseResultQuery(query: string | Record<string, string | undefined>): Required<Omit<ResultPageParams, "planIndex">> & { planIndex?: number };
```

Defaults must match the spec: 3 people, family child, 80 budget, 40 minutes, 清淡/不辣, 菜市场, finishTime 18:30, slow.

- [ ] **Step 3: Implement navigation adapter**

Create `food-uniapp/src/adapters/navigation.ts`:

```ts
export function goResult(url: string) {
  uni.navigateTo({ url });
}

export function goHome() {
  uni.navigateBack({
    delta: 1,
    fail: () => uni.redirectTo({ url: "/pages/index/index" }),
  });
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
cd food-uniapp
npx vitest run src/tests/resultUrl.test.ts
```

Expected: all tests pass.

### Task 6: Build Index Page

**Files:**
- Create: `food-uniapp/src/pages/index/index.vue`
- Create: `food-uniapp/src/adapters/storage.ts`

- [ ] **Step 1: Implement storage adapter**

Create `food-uniapp/src/adapters/storage.ts`:

```ts
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(key);
    return value === "" || value === undefined || value === null ? fallback : (value as T);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, value);
  } catch {
    // Current-session UI still works if storage is unavailable.
  }
}
```

- [ ] **Step 2: Build page state**

`index.vue` state must include:

```ts
const visibleDishNames = ref(DEFAULT_HOME_DISH_NAMES);
const selectedDishes = ref(DEFAULT_HOME_DISH_NAMES.slice(0, 4));
const savedDishes = ref<string[]>([]);
const filter = ref<"all" | "saved">("all");
const searchOpen = ref(false);
const searchQuery = ref("");
```

- [ ] **Step 3: Build computed dishes**

Use this behavior:

```ts
const source = computed(() =>
  searchQuery.value.trim() ? HOME_DISH_POOL : homeDishesFromNames(visibleDishNames.value)
);
const filteredDishes = computed(() => {
  const base =
    filter.value === "saved"
      ? source.value.filter((dish) => savedDishes.value.includes(dish.name))
      : source.value;
  return searchHomeDishes(base, searchQuery.value.trim());
});
```

- [ ] **Step 4: Implement actions**

Actions required:

- `toggleDish(name: string)`
- `toggleSaved(name: string)`
- `refreshDishes()`
- `toggleSearch()`
- `clearSearch()`
- `generateRecipe()`
- `useLastChoice()`

`generateRecipe()` must block empty selection with:

```ts
uni.showToast({ title: "先选一道菜", icon: "none" });
```

- [ ] **Step 5: Build template**

The visible UI must include:

- Brand text `今天吃什么`。
- Subtitle `点几道想吃的菜，直接生成买菜清单和做饭顺序`。
- Last choice card when saved.
- Filter buttons `全部` and `收藏`。
- Search button and refresh button.
- Search input placeholder `搜菜名、分类、口味或食材`。
- Dish rows with status, name, category/time/note, favorite action.
- Empty state.
- Bottom submit bar.

- [ ] **Step 6: Commit index page**

Run:

```bash
git add food-uniapp/src/pages/index/index.vue food-uniapp/src/adapters/storage.ts
git commit -m "Build uni-app dish picker home page

Constraint: Home page must stay a picker-first flow, not the old questionnaire flow.
Confidence: medium
Scope-risk: moderate
Tested: Storage adapter and page state reviewed against the spec
Not-tested: Result page navigation, H5 runtime, and mini-program runtime"
```

### Task 7: Build Result Page

**Files:**
- Create: `food-uniapp/src/pages/result/result.vue`

- [ ] **Step 1: Parse query on load**

Use `onLoad((options) => { ... })` to parse result params through `parseResultQuery(options)`.

- [ ] **Step 2: Build request**

Map parsed params to `GenerateRequest`:

```ts
const request: GenerateRequest = {
  city: "深圳",
  people_count: params.people,
  has_child: params.family === "child" || params.family === "both",
  has_elder: params.family === "elder" || params.family === "both",
  budget: params.budget,
  meal_type: "晚餐",
  taste: params.taste,
  avoid: params.avoid,
  favorite_foods: params.favoriteFoods,
  selected_dishes: params.selectedDishes,
  time_limit: params.time,
  finish_time: params.finishTime,
  cook_speed: params.cookSpeed,
  variant: params.variant,
  shopping_channel: params.channel,
  kitchen_tools: ["炒锅", "电饭锅"],
};
```

- [ ] **Step 3: Render required blocks**

Render:

- Result subtitle.
- Selected dish strip.
- Daily recommended.
- Daily not recommended.
- Plan tabs.
- Active plan card.
- Menu.
- Shopping list.
- Cooking schedule.
- Cooking order.
- Recipe steps and tips.

- [ ] **Step 4: Implement actions**

Actions required:

- `selectPlan(index: number)`
- `rememberPlan(index: number)`
- `editConditions()`
- `swapTable()`

`swapTable()` must increment `variant` by 1 and regenerate by redirecting to the same result page with the updated query.

`rememberPlan` stores:

```ts
{
  planIndex: index,
  planTitle: plan.title,
  planType: plan.type,
  resultUrl: buildResultPageUrl({ ...params, planIndex: index }),
  form: params,
  savedAt: new Date().toISOString()
}
```

- [ ] **Step 5: Commit result page**

Run:

```bash
git add food-uniapp/src/pages/result/result.vue
git commit -m "Build uni-app meal result page

Constraint: Result page must expose shopping list, schedule, cooking order, and recipe steps in one flow.
Confidence: medium
Scope-risk: moderate
Tested: Result page state mapping reviewed against the spec
Not-tested: H5 runtime, mini-program runtime, and multi-platform builds"
```

### Task 8: Verification Pass

**Files:**
- Modify only files required by failing checks.

- [ ] **Step 1: Run unit tests**

Run:

```bash
cd food-uniapp
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Run H5 build**

Run:

```bash
cd food-uniapp
npm run build:h5
```

Expected: H5 build succeeds.

- [ ] **Step 3: Run WeChat Mini Program build**

Run:

```bash
cd food-uniapp
npm run build:mp-weixin
```

Expected: WeChat Mini Program build succeeds and outputs under `dist/build/mp-weixin`.

- [ ] **Step 4: Manual H5 smoke**

Run:

```bash
cd food-uniapp
npm run dev:h5
```

Manual checks:

- Home page shows 12 default dishes.
- Search `汤` searches full catalog.
- Select and unselect dishes changes bottom count.
- Favorite a dish, switch to the favorite tab, and verify the dish appears.
- Unfavorite that dish and verify it disappears from the favorite tab.
- Refresh dishes and verify selected dishes remain selected while unselected dishes change.
- Clear all selected dishes, tap generate, and verify the app shows `先选一道菜`.
- Generate opens result page.
- Result page subtitle shows `按首页已选 N 道生成`.
- First result plan dish order equals the selected home dishes that exist in the migrated dish catalog.
- Swap table increments `variant` and regenerates the result.
- `就用这桌` stores last choice and home page can reopen it.

- [ ] **Step 5: Manual WeChat smoke**

Open `food-uniapp/dist/build/mp-weixin` in WeChat DevTools.

Manual checks:

- Compile succeeds.
- Home page touch targets are usable on mobile viewport.
- Favorite a dish, switch to the favorite tab, and verify the dish appears.
- Unfavorite that dish and verify it disappears from the favorite tab.
- Refresh dishes and verify selected dishes remain selected while unselected dishes change.
- Clear all selected dishes, tap generate, and verify the app shows `先选一道菜`.
- Generate opens result page.
- Result page subtitle shows `按首页已选 N 道生成`.
- First result plan dish order equals the selected home dishes that exist in the migrated dish catalog.
- Swap table increments `variant` and regenerates the result.
- Result page scrolls through all required sections.
- `就用这桌` stores last choice and home page can reopen it.

- [ ] **Step 6: Final commit**

Run:

```bash
git add food-uniapp
git commit -m "Verify uni-app rebuild MVP

Constraint: H5 and WeChat mini-program are the first supported platforms.
Confidence: high
Scope-risk: moderate
Tested: npx vitest run; npm run build:h5; npm run build:mp-weixin; manual H5 smoke; manual WeChat DevTools smoke
Not-tested: Alipay, Douyin, Baidu, Kuaishou, App, and HarmonyOS builds"
```

## 4. Self Review Checklist

- Product spec coverage: data migration, full-catalog search, data-backed generation, favorite tab behavior, refresh preservation, empty-selection guard, selected-dish result subtitle, first-plan selected-dish order, variant refresh, last-choice reopen, and H5/WeChat end-to-end flow are covered.
- No hidden dependency on current Next.js pages: domain rules are ported, not imported from the old app.
- No scope creep into login, Supabase, DeepSeek production generation, cross-device sync, or admin tools.
- Main migration risk: porting `lib/mockPlans.ts` is the largest logic task and should be reviewed against current unit tests before UI work.
