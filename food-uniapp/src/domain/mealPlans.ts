import dishesSeed from "@/data/dishes.seed.json";
import ingredientsSeed from "@/data/ingredients.seed.json";
import type { Dish, DishCategory, GenerateRequest, GenerateResponse, MealPlan } from "./types";
import { getDailyNotRecommended, getDailyRecommended } from "./foodInsights";

type IngredientRow = {
  standard_name: string;
  category: string;
  platform_keywords?: Record<string, string[] | undefined>;
};

const dishes = dishesSeed as Dish[];
const ingredients = ingredientsSeed as IngredientRow[];
const dishByName = new Map(dishes.map((dish) => [dish.dish_name, dish]));
const ingredientKeywords = new Map(
  ingredients.map((item) => [
    item.standard_name,
    Array.from(new Set(Object.values(item.platform_keywords ?? {}).flat().filter(Boolean) as string[])),
  ])
);

const costScore: Record<string, number> = {
  低: 12,
  中: 20,
  高: 34,
};

const planTypeSuitability: Record<MealPlan["type"], string[]> = {
  省钱快手型: ["工作日", "预算友好", "少踩雷"],
  营养均衡型: ["有荤有素", "汤水搭配", "深圳家常"],
  孩子老人友好型: ["清淡软烂", "孩子老人", "少辣少油"],
  改善伙食型: ["周末改善", "想吃好点", "下饭"],
};

function hashText(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function scoreDish(dish: Dish, req: GenerateRequest, type: MealPlan["type"]): number {
  let score = 0;
  if (dish.meal_type?.includes(req.meal_type)) score += 20;
  if (req.taste.some((taste) => dish.taste.includes(taste))) score += 12;
  if (req.has_child && dish.kid_friendly) score += 10;
  if (req.has_elder && dish.elder_friendly) score += 10;
  if (type === "省钱快手型" && dish.estimated_cost_level === "低") score += 18;
  if (type === "省钱快手型" && dish.time_minutes <= req.time_limit) score += 12;
  if (type === "孩子老人友好型" && dish.kid_friendly && dish.elder_friendly) score += 24;
  if (type === "改善伙食型" && dish.category === "荤菜") score += 10;
  score -= dish.difficulty * 2;
  score -= Math.max(0, dish.time_minutes - req.time_limit);
  score += hashText(`${dish.dish_name}:${req.variant ?? 0}:${type}`) % 11;
  return score;
}

function blockedByRequest(dish: Dish, req: GenerateRequest): boolean {
  const avoid = req.avoid.map((item) => item.trim()).filter(Boolean);
  if (!avoid.length) return false;
  const tags = [
    dish.dish_name,
    dish.category,
    dish.cuisine,
    ...(dish.avoid_tags ?? []),
    ...(dish.main_ingredients ?? []),
    ...(dish.optional_ingredients ?? []),
  ];
  return avoid.some((item) => tags.some((tag) => tag.includes(item)));
}

function pickDish(
  req: GenerateRequest,
  type: MealPlan["type"],
  categories: DishCategory[],
  used: Set<string>
): Dish {
  const pool = dishes
    .filter((dish) => categories.includes(dish.category))
    .filter((dish) => !used.has(dish.dish_name))
    .filter((dish) => !blockedByRequest(dish, req))
    .filter((dish) => (type === "孩子老人友好型" ? dish.kid_friendly && dish.elder_friendly : true))
    .sort((a, b) => scoreDish(b, req, type) - scoreDish(a, req, type));

  const picked = pool[0] ?? dishes.find((dish) => !used.has(dish.dish_name)) ?? dishes[0];
  used.add(picked.dish_name);
  return picked;
}

function selectedSeedDishes(req: GenerateRequest): Dish[] {
  const selectedNames = Array.from(
    new Set((req.selected_dishes ?? []).map((name) => name.trim()).filter(Boolean))
  ).slice(0, 12);

  return selectedNames
    .map((name) => dishByName.get(name))
    .filter((dish): dish is Dish => Boolean(dish));
}

function buildTips(dish: Dish, req: GenerateRequest): string[] {
  const tips = [
    `${dish.category}先按菜名单独分装，做饭时不容易乱。`,
    req.cook_speed === "slow" || req.cook_speed === "beginner"
      ? "火候宁可稳一点，最后统一尝咸淡。"
      : "先把耗时菜开锅，快手菜留到最后炒。",
  ];

  if (dish.kid_friendly && req.has_child) tips.push("给孩子吃的部分可以少盐、少油、切小块。");
  if (dish.elder_friendly && req.has_elder) tips.push("给老人吃的部分尽量软烂一点。");
  return tips;
}

function toPlanDish(dish: Dish, req: GenerateRequest) {
  return {
    name: dish.dish_name,
    category: dish.category,
    reason: `${dish.cuisine} · ${dish.time_minutes} 分钟 · ${dish.taste.join("/")}`,
    ingredients: dish.shopping_amount_for_3_people ?? [],
    steps: dish.steps,
    tips: buildTips(dish, req),
  };
}

function buildShoppingList(selected: Dish[]) {
  return selected.map((dish) => ({
    category: dish.dish_name,
    items: (dish.shopping_amount_for_3_people ?? []).map((item) => ({
      name: item.name,
      amount: item.amount,
      search_keywords: ingredientKeywords.get(item.name),
    })),
  }));
}

function parseClockTime(value: string | undefined): number | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatClockTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function withCookingSchedule(plan: MealPlan, req: GenerateRequest): MealPlan {
  const finishAt = parseClockTime(req.finish_time);
  if (finishAt === null) return plan;
  const startAt = finishAt - plan.total_time;
  const tasks = [
    "淘米煮饭，顺手把菜和肉按菜名分好",
    ...plan.dishes.map((dish) => `${dish.name}：先做备菜和预处理`),
    ...plan.dishes.map((dish) => `${dish.name}：正式烹饪`),
    "集中摆盘，汤菜保温，最后尝咸淡",
  ].slice(0, 6);
  const interval = Math.max(6, Math.floor(plan.total_time / Math.max(1, tasks.length - 1)));

  return {
    ...plan,
    finish_time: req.finish_time,
    cook_speed: req.cook_speed,
    cooking_schedule: tasks.map((task, index) => ({
      time: formatClockTime(startAt + interval * index),
      task,
    })),
  };
}

function buildPlan(req: GenerateRequest, type: MealPlan["type"], selected: Dish[]): MealPlan {
  const estimatedCost = selected.reduce((sum, dish) => sum + (costScore[dish.estimated_cost_level] ?? 18), 0);
  const totalTime = Math.max(
    12,
    Math.min(
      req.time_limit + (req.cook_speed === "beginner" ? 20 : req.cook_speed === "slow" ? 10 : 0),
      selected.reduce((sum, dish) => sum + Math.ceil(dish.time_minutes * 0.55), 8)
    )
  );

  const plan: MealPlan = {
    type,
    title: selected.map((dish) => dish.dish_name).slice(0, 2).join(" + "),
    estimated_cost: Math.min(Math.max(estimatedCost, 18), req.budget + 60),
    total_time: totalTime,
    suitable_for: selected.length === (req.selected_dishes ?? []).length ? ["首页自选", "按菜生成", "可复制"] : planTypeSuitability[type],
    dishes: selected.map((dish) => toPlanDish(dish, req)),
    shopping_list: buildShoppingList(selected),
    cooking_order: [
      "先洗米煮饭，顺手把所有食材按菜名分好",
      ...selected
        .slice()
        .sort((a, b) => b.time_minutes - a.time_minutes)
        .map((dish) => `${dish.dish_name}：${dish.steps[0]}`),
      "最后集中做快手青菜和蛋类，所有菜上桌前统一尝咸淡",
    ],
    reason:
      selected.length === (req.selected_dishes ?? []).length
        ? `按你在首页选的 ${selected.length} 道菜生成，买菜清单和做法都围绕这组菜单整理。`
        : "按预算、时间、家庭成员和深圳家常口味自动搭配。",
  };

  return withCookingSchedule(plan, req);
}

function generatedPlan(req: GenerateRequest, type: MealPlan["type"], used: Set<string>): MealPlan {
  const selected = [
    pickDish(req, type, ["荤菜", "蛋类", "豆腐"], used),
    pickDish(req, type, ["素菜"], used),
    pickDish(req, type, ["汤"], used),
    pickDish(req, type, ["蛋类", "豆腐", "主食", "蒸菜", "荤菜"], used),
  ];

  return buildPlan(req, type, selected);
}

export function getMealPlans(req: GenerateRequest): MealPlan[] {
  const used = new Set<string>();
  const selected = selectedSeedDishes(req);
  selected.forEach((dish) => used.add(dish.dish_name));

  const thirdType: MealPlan["type"] = req.has_child || req.has_elder ? "孩子老人友好型" : "改善伙食型";
  const generated = [
    generatedPlan(req, "省钱快手型", used),
    generatedPlan(req, "营养均衡型", used),
    generatedPlan(req, thirdType, used),
  ];

  if (!selected.length) return generated;
  return [buildPlan(req, "营养均衡型", selected), ...generated.slice(0, 2)];
}

export function buildGenerateResponse(req: GenerateRequest): GenerateResponse {
  return {
    plans: getMealPlans(req),
    daily_recommended: getDailyRecommended(),
    daily_not_recommended: getDailyNotRecommended(),
  };
}
