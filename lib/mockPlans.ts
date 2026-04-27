import type { DishCategory, GenerateRequest, MealPlan } from "./types";
import dishesSeed from "@/data/dishes.seed.json";
import ingredientsSeed from "@/data/ingredients.seed.json";
import shenzhenSeason from "@/data/season-shenzhen.json";
import priceBaseline from "@/data/price-baseline.json";

type SeedDish = (typeof dishesSeed)[number];

const ingredientCategory = new Map(
  (ingredientsSeed as { standard_name: string; category: string }[]).map((item) => [
    item.standard_name,
    item.category,
  ])
);

const RECIPE_STEPS: Record<string, string[]> = {
  番茄炒蛋: [
    "番茄切块，鸡蛋打散后加少许盐。",
    "热锅加油，先把鸡蛋炒到半凝固后盛出。",
    "锅里补一点油，下番茄炒出汁，可以加少许糖提鲜。",
    "倒回鸡蛋快速翻炒，加盐调味后出锅。",
  ],
  土豆焖鸡: [
    "鸡腿切块，冷水下锅焯出血沫后捞出。",
    "土豆去皮切块，姜蒜切片备用。",
    "热油爆香姜蒜，下鸡块炒到表面微黄。",
    "加生抽、少许老抽和糖炒匀，再加热水没过食材。",
    "下土豆焖 20 分钟，最后大火收汁。",
  ],
  蒜蓉生菜: [
    "生菜掰开洗净，沥干水分。",
    "蒜切末，热锅冷油小火炒香蒜末。",
    "转大火下生菜快速翻炒 30 秒。",
    "加盐和少许生抽调味，菜叶刚变软就出锅。",
  ],
  紫菜蛋花汤: [
    "紫菜撕小块放入碗里，鸡蛋打散。",
    "锅里烧开水，加入少许盐调底味。",
    "关小火后淋入蛋液，形成蛋花。",
    "倒入紫菜，滴几滴香油，撒葱花即可。",
  ],
  清蒸鲈鱼: [
    "鲈鱼洗净，两面斜划几刀，鱼身和鱼肚放姜片。",
    "水开后把鱼上锅，大火蒸 8 分钟左右。",
    "倒掉盘中腥水，铺上新鲜葱丝。",
    "淋蒸鱼豉油，再浇一勺热油激香。",
  ],
  玉米胡萝卜排骨汤: [
    "排骨冷水下锅焯水，捞出冲净浮沫。",
    "玉米切段，胡萝卜切滚刀块。",
    "汤锅加水，下排骨、玉米、胡萝卜和姜片。",
    "大火煮开后转中小火炖 35 分钟，加盐调味。",
  ],
  清炒菜心: [
    "菜心洗净，粗梗对半切开方便熟透。",
    "热锅加油，先下蒜末炒香。",
    "下菜心大火快炒，沿锅边淋一点水帮助断生。",
    "加盐调味，菜心变翠绿后马上出锅。",
  ],
  蒜蓉蒸茄子: [
    "茄子切条，放入盘中，上锅蒸 8 分钟。",
    "蒜切末，用热油小火炒香。",
    "加入生抽、少许蚝油和一点糖调成蒜蓉汁。",
    "把蒜蓉汁淋在蒸好的茄子上，撒葱花即可。",
  ],
  肉末蒸蛋: [
    "鸡蛋打散，加入 1.5 倍温水和少许盐搅匀。",
    "蛋液过筛倒入碗中，表面放调好味的肉末。",
    "盖盘子或耐热保鲜膜，冷水上锅。",
    "水开后转中小火蒸 10 分钟，出锅淋少许生抽。",
  ],
  番茄牛肉: [
    "牛肉切片，加料酒、生抽、淀粉和少许油腌 15 分钟。",
    "番茄切块，蒜切末备用。",
    "热油快炒牛肉到变色后盛出。",
    "下蒜末和番茄炒出汁，倒回牛肉。",
    "加盐和少许糖调味，翻炒 1 分钟出锅。",
  ],
  冬瓜肉丸汤: [
    "冬瓜去皮切片，猪肉末加盐、料酒、淀粉搅上劲。",
    "锅里加水和姜片烧开，下冬瓜煮 5 分钟。",
    "转小火，用勺子把肉馅团成丸子下锅。",
    "丸子浮起后再煮 2 分钟，加盐调味。",
  ],
  清炒上海青: [
    "上海青掰开洗净，菜梗和菜叶分开放。",
    "热锅加油，先下蒜末和菜梗翻炒。",
    "菜梗变软后下菜叶继续大火快炒。",
    "加盐调味，菜叶刚塌下去就出锅。",
  ],
  虾仁滑蛋: [
    "虾仁加盐、料酒和少许淀粉抓匀腌 10 分钟。",
    "鸡蛋打散，加少许盐和一点温水。",
    "热锅加油，先把虾仁炒到变色。",
    "倒入蛋液，转中小火推炒到嫩滑凝固。",
  ],
  "梅菜扣肉（半成品微改）": [
    "半成品拆开后连汤汁倒入深盘。",
    "蒸锅水开后上锅蒸 20 分钟。",
    "出锅后把汤汁倒入小锅，按口味加一点生抽或糖收浓。",
    "把浓汁淋回扣肉，撒葱花即可。",
  ],
  白灼芥兰: [
    "芥兰削去老皮，洗净后切段。",
    "锅里烧开水，加盐和几滴油。",
    "下芥兰焯 1 分钟，捞出沥水摆盘。",
    "淋生抽，浇一点蒜香热油。",
  ],
  丝瓜蛋花汤: [
    "丝瓜去皮切滚刀块，鸡蛋打散。",
    "锅里加少许油，下丝瓜翻炒到微微变软。",
    "加热水煮 3 分钟。",
    "淋入蛋液成蛋花，加盐和葱花调味。",
  ],
};

function withRecipeSteps(plan: MealPlan): MealPlan {
  return {
    ...plan,
    dishes: plan.dishes.map((dish) => ({
      ...dish,
      steps: RECIPE_STEPS[dish.name] ?? [
        "食材洗净切好，按买菜清单提前分装。",
        "先处理需要久煮或久蒸的部分，再做快手菜。",
        "出锅前尝味道，根据家人口味补盐或生抽。",
      ],
    })),
  };
}

const DEFAULT_FINISH_TIME = "12:00";

const SPEED_BUFFER_MINUTES: Record<NonNullable<GenerateRequest["cook_speed"]>, number> = {
  normal: 0,
  slow: 10,
  beginner: 20,
};

function parseClockTime(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function formatClockTime(totalMinutes: number): string {
  const minutesInDay = 24 * 60;
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function pickScheduleTasks(cookingOrder: string[], count: number): string[] {
  if (cookingOrder.length === 0) {
    return ["整理食材", "开始备菜", "处理主菜", "准备收尾", "检查味道"].slice(0, count);
  }

  if (count === 1) {
    return [cookingOrder[0]];
  }

  return Array.from({ length: count }, (_, index) => {
    const sourceIndex = Math.round((index * (cookingOrder.length - 1)) / (count - 1));
    return cookingOrder[sourceIndex];
  });
}

function buildCookingSchedule(
  plan: MealPlan,
  finishTime: string,
  cookSpeed: NonNullable<GenerateRequest["cook_speed"]>
): NonNullable<MealPlan["cooking_schedule"]> {
  const finishMinutes = parseClockTime(finishTime) ?? parseClockTime(DEFAULT_FINISH_TIME)!;
  const effectiveTime = plan.total_time + SPEED_BUFFER_MINUTES[cookSpeed];
  const nodeCount = Math.min(6, Math.max(4, plan.cooking_order.length + 1));
  const taskCount = nodeCount - 1;
  const tasks = pickScheduleTasks(plan.cooking_order, taskCount);

  const schedule = tasks.map((task, index) => {
    const minutesAfterStart = Math.round((effectiveTime * index) / (nodeCount - 1));

    return {
      time: formatClockTime(finishMinutes - effectiveTime + minutesAfterStart),
      task,
    };
  });

  schedule.push({
    time: formatClockTime(finishMinutes),
    task: "完成收尾，上桌开饭",
  });

  return schedule;
}

function withCookingSchedule(plan: MealPlan, req: GenerateRequest): MealPlan {
  const finishTime = parseClockTime(req.finish_time ?? "") === null ? DEFAULT_FINISH_TIME : req.finish_time!;
  const cookSpeed = req.cook_speed ?? "normal";

  return {
    ...plan,
    finish_time: finishTime,
    cook_speed: cookSpeed,
    cooking_schedule: buildCookingSchedule(plan, finishTime, cookSpeed),
  };
}

const costScore: Record<string, number> = {
  低: 18,
  中: 32,
  高: 58,
};

const FAVORITE_RECOMMEND_PERCENT = 50;

const monthlySeason = shenzhenSeason.monthly as Record<string, string[]>;
const priceByName = new Map(
  (priceBaseline as {
    name: string;
    current_price: number;
    cheap_threshold: number;
    expensive_threshold: number;
  }[]).map((item) => [item.name, item])
);

function seasonalNamesForCurrentMonth(): Set<string> {
  return new Set(monthlySeason[String(new Date().getMonth() + 1)] ?? []);
}

function currentDateKey(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function recommendationDateKey(req: GenerateRequest): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(req.recommendation_date ?? "")
    ? req.recommendation_date!
    : currentDateKey();
}

function hashText(value: string): number {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function normalizeFavoriteFoods(value: GenerateRequest["favorite_foods"]): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.slice(0, 24))
    )
  ).slice(0, 12);
}

function ingredientPriceTier(name: string): "便宜" | "正常" | "偏贵" | "很贵" {
  const row = priceByName.get(name);

  if (!row) return "正常";
  if (row.current_price <= row.cheap_threshold) return "便宜";
  if (row.current_price < row.expensive_threshold) return "正常";
  if (row.current_price < row.expensive_threshold * 1.2) return "偏贵";
  return "很贵";
}

function dishPriceScore(dish: SeedDish, type: MealPlan["type"]): number {
  return dish.main_ingredients.reduce((score, name) => {
    const tier = ingredientPriceTier(name);

    if (tier === "便宜") return score + (type === "省钱快手型" ? 2 : 1);
    if (tier === "偏贵") return score - (type === "省钱快手型" ? 3 : type === "改善伙食型" ? 1 : 2);
    if (tier === "很贵") return score - (type === "改善伙食型" ? 5 : 8);
    return score;
  }, 0);
}

function blockedByRequest(dish: SeedDish, req: GenerateRequest): boolean {
  const avoidText = [...(dish.avoid_tags ?? []), ...dish.main_ingredients, dish.dish_name].join(
    " "
  );

  return req.avoid.some((tag) => avoidText.includes(tag));
}

function matchesFavoriteFood(dish: SeedDish, favorite: string): boolean {
  return (
    dish.dish_name.includes(favorite) ||
    dish.main_ingredients.some(
      (ingredient) => ingredient === favorite || ingredient.includes(favorite)
    )
  );
}

function favoritePick(req: GenerateRequest): { favorite: string; dish: SeedDish } | null {
  const favorites = normalizeFavoriteFoods(req.favorite_foods);
  if (favorites.length === 0) return null;

  const baseSeed = `${recommendationDateKey(req)}|${req.user_id ?? ""}|${favorites.join("|")}`;
  const roll = hashText(baseSeed) % 100;
  if (roll >= FAVORITE_RECOMMEND_PERCENT) return null;

  const firstFavoriteIndex = hashText(`${baseSeed}|favorite`) % favorites.length;
  const orderedFavorites = favorites
    .slice(firstFavoriteIndex)
    .concat(favorites.slice(0, firstFavoriteIndex));

  for (const favorite of orderedFavorites) {
    const candidates = (dishesSeed as SeedDish[])
      .filter((dish) => matchesFavoriteFood(dish, favorite))
      .filter((dish) => !blockedByRequest(dish, req))
      .sort((a, b) => scoreDish(b, req, "营养均衡型") - scoreDish(a, req, "营养均衡型"));

    if (candidates.length > 0) {
      const dish = candidates[hashText(`${baseSeed}|${favorite}|dish`) % candidates.length];
      return { favorite, dish };
    }
  }

  return null;
}

function withFavoriteReason(reason: string): string {
  return reason.includes("喜欢") ? reason : `今天抽中你的喜欢 · ${reason}`;
}

function withDailyFavorite(plans: MealPlan[], req: GenerateRequest): MealPlan[] {
  const pick = favoritePick(req);
  if (!pick) return plans;

  const existingPlanIndex = plans.findIndex((plan) =>
    plan.dishes.some((dish) => {
      const seedDish = (dishesSeed as SeedDish[]).find((item) => item.dish_name === dish.name);
      return seedDish ? matchesFavoriteFood(seedDish, pick.favorite) : dish.name.includes(pick.favorite);
    })
  );
  if (existingPlanIndex >= 0) {
    return plans.map((plan, planIndex) =>
      planIndex === existingPlanIndex
        ? {
            ...plan,
            dishes: plan.dishes.map((dish) =>
              (() => {
                const seedDish = (dishesSeed as SeedDish[]).find(
                  (item) => item.dish_name === dish.name
                );
                return (seedDish && matchesFavoriteFood(seedDish, pick.favorite)) ||
                  dish.name.includes(pick.favorite)
                  ? { ...dish, reason: withFavoriteReason(dish.reason) }
                  : dish;
              })()
            ),
          }
        : plan
    );
  }

  const targetPlanIndex = 0;
  const targetPlan = plans[targetPlanIndex];
  if (!targetPlan) return plans;

  const replacementIndex = targetPlan.dishes.findIndex(
    (dish) => dish.category === (pick.dish.category as DishCategory)
  );
  const dishIndex = replacementIndex >= 0 ? replacementIndex : targetPlan.dishes.length - 1;
  const favoriteDish = toPlanDish(pick.dish, req);
  const nextDishes = targetPlan.dishes.slice();
  nextDishes[dishIndex] = {
    ...favoriteDish,
    reason: withFavoriteReason(favoriteDish.reason),
  };
  const selectedSeedDishes = nextDishes
    .map((dish) => (dishesSeed as SeedDish[]).find((seed) => seed.dish_name === dish.name))
    .filter((dish): dish is SeedDish => Boolean(dish));
  const nextPlan: MealPlan = {
    ...targetPlan,
    title: nextDishes.map((dish) => dish.name).slice(0, 2).join(" + "),
    dishes: nextDishes,
    shopping_list: buildShoppingList(selectedSeedDishes),
    cooking_order: [
      "先洗米煮饭，顺手把汤锅或蒸锅准备好",
      ...selectedSeedDishes
        .slice()
        .sort((a, b) => b.time_minutes - a.time_minutes)
        .map((dish) => `${dish.dish_name}：${dish.steps[0]}`),
      "最后集中炒青菜、调味收尾，上桌前尝咸淡",
    ],
  };

  return plans.map((plan, index) =>
    index === targetPlanIndex ? withCookingSchedule(nextPlan, req) : plan
  );
}

function scoreDish(dish: SeedDish, req: GenerateRequest, type: MealPlan["type"]): number {
  let score = 0;
  const seasonalNames = seasonalNamesForCurrentMonth();
  const budgetPerPerson = req.budget / Math.max(1, req.people_count);

  if (dish.time_minutes <= req.time_limit) score += 3;
  if (dish.estimated_cost_level === "低") score += type === "省钱快手型" ? 4 : 1;
  if (dish.estimated_cost_level === "中") score += type === "营养均衡型" ? 2 : 1;
  if (budgetPerPerson >= 50 && type !== "省钱快手型") {
    if (dish.estimated_cost_level === "高") score += type === "改善伙食型" ? 14 : 8;
    if (dish.estimated_cost_level === "中") score += 4;
    if (dish.estimated_cost_level === "低") score -= type === "改善伙食型" ? 6 : 3;
  } else if (budgetPerPerson >= 35 && type !== "省钱快手型") {
    if (dish.estimated_cost_level === "高") score += 5;
    if (dish.estimated_cost_level === "中") score += 3;
    if (dish.estimated_cost_level === "低") score -= 2;
  }
  if (req.has_child && dish.kid_friendly) score += type === "孩子老人友好型" ? 5 : 2;
  if (req.has_elder && dish.elder_friendly) score += type === "孩子老人友好型" ? 5 : 2;
  if (req.taste.some((taste) => dish.taste.includes(taste))) score += 2;
  if (dish.cuisine === "广东家常") score += 1;
  if (dish.season?.includes(new Date().getMonth() + 1)) score += 1;
  if (dish.main_ingredients.some((name) => seasonalNames.has(name))) score += 4;
  score += dishPriceScore(dish, type);
  if (type === "改善伙食型" && dish.estimated_cost_level !== "低") score += 2;

  return score;
}

function pickDish(
  pool: SeedDish[],
  req: GenerateRequest,
  type: MealPlan["type"],
  categories: string[],
  used: Set<string>
): SeedDish {
  const variant = Math.max(0, Math.floor(req.variant ?? 0));
  const candidates = pool
    .filter((dish) => categories.includes(dish.category))
    .filter((dish) => !used.has(dish.dish_name))
    .filter((dish) => !blockedByRequest(dish, req))
    .sort((a, b) => scoreDish(b, req, type) - scoreDish(a, req, type));

  const selected =
    candidates[variant % Math.max(1, candidates.length)] ??
    pool.find((dish) => !used.has(dish.dish_name)) ??
    pool[0];
  used.add(selected.dish_name);
  return selected;
}

function allDishIngredients(dish: SeedDish): string[] {
  return [...dish.main_ingredients, ...(dish.optional_ingredients ?? [])];
}

function dishHas(dish: SeedDish, pattern: RegExp): boolean {
  return allDishIngredients(dish).some((item) => pattern.test(item)) || pattern.test(dish.dish_name);
}

function formatRecipeMaterials(dish: SeedDish): string {
  const main =
    dish.shopping_amount_for_3_people
      ?.map((item) => `${item.name} ${item.amount}`)
      .join("、") || dish.main_ingredients.join("、");
  const optional = (dish.optional_ingredients ?? [])
    .filter((name) => !dish.main_ingredients.includes(name))
    .slice(0, 4);

  return optional.length ? `${main}；家里有的话备${optional.join("、")}。` : `${main}。`;
}

function hasAnimalProtein(dish: SeedDish): boolean {
  return dishHas(dish, /猪|牛|羊|鸡|鸭|鱼|虾|排骨|肉|肝|鱿|贝|蛤|蛋/);
}

function buildCoachGoal(dish: SeedDish, req: GenerateRequest): string {
  const method = dish.cooking_methods?.[0] ?? dish.category;
  const taste = dish.taste[0] ?? "家常";
  const friendlyNote =
    req.has_child || req.has_elder
      ? "口感尽量软一点、味道淡一点"
      : "保留食材本味，不要把火候做老";
  const focus = dishHas(dish, /猪肝/)
    ? dishHas(dish, /枸杞/)
      ? "猪肝去腥、口感嫩、枸杞最后放"
      : "猪肝去腥、口感嫩，青菜最后放"
    : dishHas(dish, /鱼/)
      ? "去腥、蒸煮时间准，鱼肉刚熟就停"
      : dish.category === "素菜"
        ? "水分沥干、火要够旺，断生就出锅"
        : dish.category === "蛋类"
          ? "蛋要嫩，配菜先处理好，别炒老"
          : method === "煮" || method === "炖"
            ? "汤味清甜，先耐煮后易熟"
            : `${method}的时候重点看火候`;

  return `关键点：${dish.dish_name}要做得${taste}、不腻，关键是${focus}；${friendlyNote}。`;
}

function buildMaterialStep(dish: SeedDish): string {
  return `材料：${formatRecipeMaterials(dish)}`;
}

function buildPrepStep(dish: SeedDish, req: GenerateRequest): string {
  const ingredients = dish.main_ingredients.slice(0, 3);
  const hasEgg = ingredients.includes("鸡蛋");
  const hasMeatMince = ingredients.includes("猪肉末");
  const hasFish = ingredients.some((item) => item.includes("鱼"));
  const mainWithoutEgg = ingredients.filter((item) => item !== "鸡蛋").join("、");
  const beginnerPrefix =
    req.cook_speed === "beginner" ? "开火前先把调料、盘子和锅具都放顺手。" : "";

  if (dishHas(dish, /猪肝/)) {
    const vegetable = dish.main_ingredients.find((item) => !/猪肝/.test(item));
    const vegetableNote = vegetable ? `${vegetable}洗净，梗和叶分开放。` : "";

    return `处理：${beginnerPrefix}猪肝切薄片，清水浸泡 20-30 分钟，中途换水 2 次，把血水泡出来；沥干后加料酒、姜丝、白胡椒粉、淀粉和一点食用油抓匀腌 10 分钟。${vegetableNote}`;
  }

  if (dish.dish_name.includes("蒸蛋") || (hasEgg && hasMeatMince)) {
    return `处理：${beginnerPrefix}鸡蛋打散后加约 1.5 倍温水，肉末用少许盐和生抽抓匀；蛋液过筛会更嫩，别直接大火硬蒸。`;
  }

  if (dish.category === "蛋类" && hasEgg) {
    return `处理：${beginnerPrefix}鸡蛋先打散，${mainWithoutEgg || "配菜"}洗净处理好；下锅前把盐和生抽放在手边，别炒到一半才找调料。`;
  }

  if (hasFish) {
    return `处理：${beginnerPrefix}${ingredients.join("、")}处理干净，鱼肚黑膜和血水要冲掉；盘底垫姜葱，腥味会轻很多。`;
  }

  if (dish.category === "素菜") {
    return `处理：${beginnerPrefix}${ingredients.join("、")}洗净沥干，菜梗和菜叶尽量分开；水太多会变成煮菜，别湿着下锅。`;
  }

  if (hasAnimalProtein(dish)) {
    return `处理：${beginnerPrefix}${ingredients.join("、")}提前处理好，容易熟的和耐煮的分开放；主料可以先用少许盐、淀粉和油抓匀，口感会更嫩。`;
  }

  return `处理：${beginnerPrefix}${ingredients.join("、")}提前洗净切好，容易熟的和耐煮的分开放；下锅前把盐、生抽或蚝油放顺手。`;
}

function buildMethodStep(dish: SeedDish): string {
  const method = dish.cooking_methods?.[0] ?? "";

  if (dishHas(dish, /猪肝/)) {
    const hasGoji = dishHas(dish, /枸杞/);
    const leaf = dish.main_ingredients.find((item) => !/猪肝|枸杞/.test(item));
    const leafStep = leaf ? `先放${leaf.includes("菜") ? `${leaf}梗` : leaf}煮 1-2 分钟，叶子最后再下。` : "";
    const gojiStep = hasGoji ? "枸杞最后放，煮 30 秒就够。" : "";

    return `下锅：锅里加水和姜片煮开，${leafStep}转中火，把猪肝一片片放进去，不要一坨倒进去；猪肝变色后再煮 30 秒-1 分钟。${gojiStep}`;
  }

  if (dish.dish_name.includes("蒸蛋")) {
    return "下锅：水开后转中小火再上锅，碗口盖盘子防止水滴进去；看到表面凝固、轻轻晃动像嫩豆腐，就可以关火焖 1-2 分钟。";
  }

  if (method === "蒸" && dish.main_ingredients.some((item) => item.includes("鱼"))) {
    return "下锅：蒸锅一定等水开再上鱼，中大火保持蒸汽；看到鱼眼发白、鱼肉能被筷子轻轻拨开就熟了，不要久蒸。";
  }

  if (method === "蒸") {
    return "下锅：蒸锅一定等水开再上菜，中火保持有蒸汽；看到主料颜色变白、筷子能轻松戳进就接近熟了，不要反复掀盖。";
  }

  if (method === "炒") {
    if (dish.category === "素菜") {
      return "下锅：锅热后再倒油，先下蒜末炒香，再放菜梗，最后放菜叶；看到菜色变亮、边缘变软就说明快好了，别一直炒到出水。";
    }

    return "下锅：锅热后再倒油，先下姜蒜或主料打底，再放配菜；看到菜色变亮、边缘变软就说明快好了，别一直炒到出水。";
  }

  if (method === "煮" || method === "炖") {
    return "下锅：先下耐煮食材煮出底味，再下易熟食材；看到汤面小滚、食材能被筷子轻松戳进，就可以准备调味。";
  }

  if (method === "焖" || method === "烧") {
    return "下锅：先把主料炒到表面变色再加水，水量到食材一半到八分高；如果锅底快干就补少量热水，不要一次加太多。";
  }

  if (method === "煎") {
    return "下锅：锅和油都热了再下锅，先别急着翻面；看到边缘定型、底面金黄再翻，主料才不容易碎。";
  }

  if (method === "焯") {
    return "下锅：水开后加一点盐和油再下菜；看到颜色变翠、梗部略软就捞出，不要久煮。";
  }

  return "下锅：按从难熟到易熟的顺序下锅；看到食材颜色和质地明显变化，再进入调味收尾。";
}

function buildDonenessStep(dish: SeedDish): string {
  const method = dish.cooking_methods?.[0] ?? "";

  if (dishHas(dish, /猪肝/)) {
    return "判断：猪肝颜色刚从红转灰粉、中心没有血水就关火；久煮会老、会柴，汤也容易浑。";
  }

  if (dish.category === "素菜") {
    return "判断：菜梗变亮、轻轻一夹能弯，菜叶刚塌下去就是熟；还想脆一点就提前 10 秒关火。";
  }

  if (dish.dish_name.includes("蒸蛋")) {
    return "判断：表面平整不流动，勺子轻压有弹性就是嫩；如果中间还有水波纹，再蒸 1 分钟。";
  }

  if (dish.category === "蛋类") {
    return "判断：蛋液大部分凝固、表面还带一点湿润时最嫩；等完全干硬再出锅就容易老。";
  }

  if (dishHas(dish, /鱼/)) {
    return "判断：鱼肉能被筷子轻轻拨开、靠骨处没有血色就是熟；闻到鲜味后不要继续硬煮。";
  }

  if (method === "煮" || method === "炖") {
    return "判断：耐煮食材能轻松戳进，汤味有甜味后再放盐；盐太早会让汤口感发紧。";
  }

  if (method === "焖" || method === "烧") {
    return "判断：主料能戳透、锅底还留一点汤汁时最好收尾；如果已经干锅，就补少量热水再调味。";
  }

  return "判断：主料熟透、配菜断生、锅里香味出来后再调味；不确定时先夹一小块尝口感。";
}

function buildCoachSteps(dish: SeedDish, req: GenerateRequest): string[] {
  const hasBones = dish.main_ingredients.some((item) =>
    /鱼|排骨|鸡腿|鸡翅|鸭肉|带鱼|鸡肉/.test(item)
  );
  const finish =
    req.has_child || req.has_elder
      ? hasBones
        ? "出锅前先尝味道，盐少量多次加；给孩子和老人吃的部分，可以剪小块、挑掉骨刺，再单独盛出来。"
        : "出锅前先尝味道，盐少量多次加；给孩子和老人吃的部分，可以剪小块或多焖一会儿，再单独盛出来。"
      : "出锅前尝一下咸淡，宁可淡一点，最后用生抽或盐微调；不要为了颜色好看把菜继续加热太久。";

  return [
    buildCoachGoal(dish, req),
    buildMaterialStep(dish),
    buildPrepStep(dish, req),
    buildMethodStep(dish),
    buildDonenessStep(dish),
    `收尾：${finish}`,
  ];
}

function buildCoachTips(dish: SeedDish, req: GenerateRequest): string[] {
  const method = dish.cooking_methods?.[0] ?? "";
  const hasBones = dish.main_ingredients.some((item) =>
    /鱼|排骨|鸡腿|鸡翅|鸭肉|带鱼|鸡肉/.test(item)
  );
  const tips = [
    `好吃小技巧：${method === "炒" ? "大火快炒、断生就出锅" : method === "蒸" ? "水开上锅、少开盖" : method === "煮" || method === "炖" ? "先耐煮后易熟，最后再调味" : "先判断熟度，再调味收尾"}。`,
  ];

  if (dishHas(dish, /猪肝/)) {
    tips.push("猪肝一定要泡出血水，下锅后别久煮，变色基本就熟了。");
    tips.push(
      dishHas(dish, /枸杞/)
        ? "枸杞最后 30 秒再放，煮久容易发酸发苦。"
        : "想更清甜可以加几粒枸杞或两片红枣，但都不要久煮。"
    );
  }

  if (req.has_child && dish.kid_friendly) {
    tips.push("孩子版：少盐少酱油，肉和菜切小一点，入口更稳。");
  }

  if (req.has_elder && dish.elder_friendly) {
    tips.push(
      hasBones
        ? "老人版：多留 2-3 分钟让食材软一点，鱼和骨头类先检查骨刺。"
        : "老人版：多留 1-2 分钟让食材软一点，少油少盐更稳。"
    );
  }

  if (req.cook_speed === "beginner") {
    tips.push("新手提醒：开火前把菜、碗、调料都摆好，先慢后稳，比边做边找更快。");
  }

  const substituteIngredient =
    dish.main_ingredients.find((item) => !["鸡蛋", "姜", "葱", "蒜"].includes(item)) ??
    dish.main_ingredients[0];
  if (substituteIngredient) {
    tips.push(`替换思路：买不到${substituteIngredient}时，优先换同类食材，做法和调味不用大改。`);
  }

  return tips;
}

function toPlanDish(dish: SeedDish, req: GenerateRequest) {
  return {
    name: dish.dish_name,
    category: dish.category as DishCategory,
    reason: `${dish.cuisine} · ${dish.time_minutes} 分钟 · ${dish.taste.join("/")}`,
    ingredients: dish.shopping_amount_for_3_people,
    steps: buildCoachSteps(dish, req),
    tips: buildCoachTips(dish, req),
  };
}

function buildShoppingList(selected: SeedDish[]) {
  const groups = new Map<string, { name: string; amount: string; search_keywords?: string[] }[]>();

  for (const dish of selected) {
    for (const item of dish.shopping_amount_for_3_people ?? []) {
      const category = ingredientCategory.get(item.name) ?? "其他";
      const list = groups.get(category) ?? [];
      if (!list.some((existing) => existing.name === item.name)) {
        list.push({ name: item.name, amount: item.amount });
      }
      groups.set(category, list);
    }
  }

  return Array.from(groups, ([category, items]) => ({ category, items }));
}

function buildCuratedPlan(
  req: GenerateRequest,
  type: MealPlan["type"],
  used: Set<string>
): MealPlan {
  const pool = dishesSeed as SeedDish[];
  const needsFriendly = type === "孩子老人友好型";
  const localPool = needsFriendly
    ? pool.filter((dish) => dish.kid_friendly && dish.elder_friendly)
    : pool;

  const selected = [
    pickDish(localPool, req, type, ["荤菜", "蛋类", "豆腐"], used),
    pickDish(localPool, req, type, ["素菜"], used),
    pickDish(localPool, req, type, ["汤"], used),
    pickDish(localPool, req, type, ["蛋类", "豆腐", "主食", "蒸菜", "荤菜"], used),
  ];

  const estimatedCost = selected.reduce(
    (sum, dish) => sum + (costScore[dish.estimated_cost_level] ?? 18),
    0
  );
  const totalTime = Math.min(
    Math.max(...selected.map((dish) => dish.time_minutes)) + 12,
    req.time_limit + (req.cook_speed === "beginner" ? 20 : req.cook_speed === "slow" ? 10 : 0)
  );

  const plan: MealPlan = {
    type,
    title: selected.map((dish) => dish.dish_name).slice(0, 2).join(" + "),
    estimated_cost: Math.min(Math.max(estimatedCost, 45), req.budget + 25),
    total_time: totalTime,
    suitable_for:
      type === "省钱快手型"
        ? ["工作日", "预算友好", "少踩雷"]
        : type === "营养均衡型"
          ? ["有荤有素", "汤水搭配", "深圳家常"]
          : type === "孩子老人友好型"
            ? ["清淡软烂", "孩子老人", "少辣少油"]
            : ["周末改善", "想吃好点", "下饭"],
    dishes: selected.map((dish) => toPlanDish(dish, req)),
    shopping_list: buildShoppingList(selected),
    cooking_order: [
      "先洗米煮饭，顺手把汤锅或蒸锅准备好",
      ...selected
        .slice()
        .sort((a, b) => b.time_minutes - a.time_minutes)
        .map((dish) => `${dish.dish_name}：${dish.steps[0]}`),
      "最后集中炒青菜、调味收尾，上桌前尝咸淡",
    ],
    reason:
      type === "省钱快手型"
        ? "优先选择低成本、短时间、家庭接受度高的菜，适合临时买菜做饭。"
        : type === "营养均衡型"
          ? "按蛋白质、蔬菜和汤水组合，兼顾深圳家庭常见口味。"
          : type === "孩子老人友好型"
            ? "避开重辣和难嚼菜，优先蒸煮、清淡、软嫩的做法。"
            : "加入更有满足感的荤菜和下饭菜，适合周末或想改善伙食。",
  };

  return withCookingSchedule(plan, req);
}

function selectedSeedDishes(req: GenerateRequest): SeedDish[] {
  const selectedNames = Array.from(
    new Set((req.selected_dishes ?? []).map((name) => name.trim()).filter(Boolean))
  ).slice(0, 12);
  if (selectedNames.length === 0) return [];

  const byName = new Map((dishesSeed as SeedDish[]).map((dish) => [dish.dish_name, dish]));
  return selectedNames
    .map((name) => byName.get(name))
    .filter((dish): dish is SeedDish => Boolean(dish));
}

function buildSelectedDishPlan(req: GenerateRequest, selected: SeedDish[]): MealPlan {
  const estimatedCost = selected.reduce(
    (sum, dish) => sum + (costScore[dish.estimated_cost_level] ?? 18),
    0
  );
  const totalTime = Math.max(
    12,
    selected.reduce((sum, dish) => sum + Math.ceil(dish.time_minutes * 0.6), 10)
  );
  const plan: MealPlan = {
    type: "营养均衡型",
    title: selected.map((dish) => dish.dish_name).slice(0, 2).join(" + "),
    estimated_cost: Math.min(Math.max(estimatedCost, 18), req.budget + 60),
    total_time: totalTime,
    suitable_for: ["首页自选", "按菜生成", "可复制"],
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
    reason: `按你在首页选的 ${selected.length} 道菜生成，买菜清单和做法都围绕这组菜单整理。`,
  };

  return withCookingSchedule(plan, req);
}

function buildCuratedPlans(req: GenerateRequest): MealPlan[] {
  const used = new Set<string>();
  const selected = selectedSeedDishes(req);
  const selectedPlan = selected.length ? buildSelectedDishPlan(req, selected) : null;
  selected.forEach((dish) => used.add(dish.dish_name));
  const thirdType: MealPlan["type"] =
    req.has_child || req.has_elder ? "孩子老人友好型" : "改善伙食型";

  const generated = [
    buildCuratedPlan(req, "省钱快手型", used),
    buildCuratedPlan(req, "营养均衡型", used),
    buildCuratedPlan(req, thirdType, used),
  ];

  if (selectedPlan) {
    return [selectedPlan, ...withDailyFavorite(generated.slice(0, 2), req)];
  }

  return withDailyFavorite(generated, req);
}

/**
 * 根据用户家庭情况返回三套 mock 菜单。
 * 真实版会走 /api/meal-plans/generate → DeepSeek API。
 */
export function getMockPlans(req: GenerateRequest): MealPlan[] {
  return buildCuratedPlans(req);

  const hasChild = !!req.has_child;
  const hasElder = !!req.has_elder;
  const thirdType: MealPlan["type"] =
    hasChild || hasElder ? "孩子老人友好型" : "改善伙食型";

  const planA: MealPlan = {
    type: "省钱快手型",
    title: "番茄鸡蛋土豆鸡腿家常晚餐",
    estimated_cost: Math.min(req.budget, 65),
    total_time: Math.min(req.time_limit, 35),
    suitable_for: ["工作日晚餐", "预算有限", "不想太复杂"],
    dishes: [
      {
        name: "番茄炒蛋",
        category: "蛋类",
        reason: "便宜快手，孩子接受度高",
      },
      {
        name: "土豆焖鸡",
        category: "荤菜",
        reason: "下饭，一锅出，省火",
      },
      {
        name: "蒜蓉生菜",
        category: "素菜",
        reason: "补充蔬菜，3 分钟出锅",
      },
      {
        name: "紫菜蛋花汤",
        category: "汤",
        reason: "最快的汤，热乎暖胃",
      },
    ],
    shopping_list: [
      {
        category: "肉蛋",
        items: [
          { name: "鸡腿", amount: "2 个", search_keywords: ["琵琶腿", "鸡腿肉"] },
          { name: "鸡蛋", amount: "5 个" },
        ],
      },
      {
        category: "蔬菜",
        items: [
          { name: "番茄", amount: "3 个", search_keywords: ["番茄", "西红柿"] },
          { name: "土豆", amount: "2 个" },
          { name: "生菜", amount: "1 斤" },
        ],
      },
      {
        category: "干货调料",
        items: [
          { name: "紫菜", amount: "1 小包" },
          { name: "葱姜蒜", amount: "适量" },
        ],
      },
    ],
    cooking_order: [
      "先洗米煮饭",
      "鸡腿切块焯水，土豆切块，一起下锅焖",
      "焖鸡的 15 分钟里洗菜、切番茄",
      "炒番茄鸡蛋",
      "炒蒜蓉生菜",
      "最后烧水煮紫菜蛋花汤",
    ],
    reason:
      "这桌菜有肉、有蛋、有青菜、有汤，平均 65 元搞定，适合工作日晚上快速搞定一餐。",
  };

  const planB: MealPlan = {
    type: "营养均衡型",
    title: "鲈鱼青菜排骨汤营养家宴",
    estimated_cost: Math.min(req.budget, 95),
    total_time: Math.min(req.time_limit + 10, 50),
    suitable_for: ["营养均衡", "广东清淡口味"],
    dishes: [
      { name: "清蒸鲈鱼", category: "荤菜", reason: "高蛋白低脂，孩子老人都能吃" },
      { name: "玉米胡萝卜排骨汤", category: "汤", reason: "汤水滋润，适合深圳天气" },
      { name: "清炒菜心", category: "素菜", reason: "广东人晚餐标配" },
      { name: "蒜蓉蒸茄子", category: "素菜", reason: "下饭，不重油" },
    ],
    shopping_list: [
      {
        category: "肉蛋海鲜",
        items: [
          { name: "鲈鱼", amount: "1 条（约 1 斤）" },
          { name: "排骨", amount: "半斤" },
        ],
      },
      {
        category: "蔬菜",
        items: [
          { name: "菜心", amount: "1 斤", search_keywords: ["菜心", "广东菜心"] },
          { name: "茄子", amount: "2 根" },
          { name: "玉米", amount: "1 根" },
          { name: "胡萝卜", amount: "1 根" },
        ],
      },
      {
        category: "干货调料",
        items: [{ name: "姜葱蒜", amount: "适量" }, { name: "蒸鱼豉油", amount: "1 瓶" }],
      },
    ],
    cooking_order: [
      "先煮米饭",
      "排骨焯水，加玉米胡萝卜炖汤（30-40 分钟，其他都在汤上锅后做）",
      "鲈鱼洗净摆盘，上面放姜葱",
      "茄子洗净切条备用",
      "鲈鱼上锅蒸 8 分钟，同时蒸茄子",
      "蒸鱼期间炒菜心",
      "鱼出锅淋豉油浇热油，茄子浇蒜蓉汁",
    ],
    reason:
      "有鱼、有汤、有青菜、有下饭菜，营养结构完整，适合一家人慢慢吃的晚餐。",
  };

  const planC_Kid: MealPlan = {
    type: "孩子老人友好型",
    title: "肉末蒸蛋番茄牛肉冬瓜汤",
    estimated_cost: Math.min(req.budget, 80),
    total_time: Math.min(req.time_limit, 40),
    suitable_for: ["有小孩", "有老人", "清淡软烂"],
    dishes: [
      { name: "肉末蒸蛋", category: "蛋类", reason: "软嫩入口，孩子老人都爱吃" },
      { name: "番茄牛肉", category: "荤菜", reason: "酸甜开胃，好嚼不柴" },
      { name: "冬瓜肉丸汤", category: "汤", reason: "清热祛湿，深圳必备汤水" },
      { name: "清炒上海青", category: "素菜", reason: "好咬好消化" },
    ],
    shopping_list: [
      {
        category: "肉蛋",
        items: [
          { name: "牛肉（牛肩肉/牛里脊）", amount: "半斤" },
          { name: "猪肉末", amount: "3 两" },
          { name: "鸡蛋", amount: "4 个" },
        ],
      },
      {
        category: "蔬菜",
        items: [
          { name: "番茄", amount: "3 个" },
          { name: "冬瓜", amount: "1 斤" },
          { name: "上海青", amount: "1 斤" },
        ],
      },
      {
        category: "调料",
        items: [{ name: "姜葱", amount: "适量" }, { name: "料酒生抽", amount: "厨房常备" }],
      },
    ],
    cooking_order: [
      "先煮米饭",
      "牛肉切片腌制（料酒+生抽+淀粉+少许油，腌 15 分钟）",
      "猪肉末调好肉馅做成丸子，冬瓜切片下锅煮",
      "蛋液调好，放猪肉末上锅蒸 10 分钟",
      "冬瓜汤快好时下肉丸",
      "炒番茄牛肉",
      "最后 3 分钟炒上海青",
    ],
    reason:
      "蒸蛋、肉丸汤都软烂，番茄牛肉酸甜不辣，上海青易嚼，一家老小都能吃得舒服。",
  };

  const planC_Upgrade: MealPlan = {
    type: "改善伙食型",
    title: "虾仁蒸蛋梅菜扣肉双人小家宴",
    estimated_cost: Math.min(req.budget, 110),
    total_time: Math.min(req.time_limit + 20, 60),
    suitable_for: ["周末", "改善伙食", "二人世界"],
    dishes: [
      { name: "虾仁滑蛋", category: "蛋类", reason: "嫩滑鲜甜，高蛋白" },
      { name: "梅菜扣肉（半成品微改）", category: "荤菜", reason: "省时且下饭" },
      { name: "白灼芥兰", category: "素菜", reason: "翠绿清爽，衬托油腻" },
      { name: "丝瓜蛋花汤", category: "汤", reason: "清甜解腻" },
    ],
    shopping_list: [
      {
        category: "肉蛋海鲜",
        items: [
          { name: "鲜虾/虾仁", amount: "半斤" },
          { name: "梅菜扣肉（半成品）", amount: "1 盒" },
          { name: "鸡蛋", amount: "4 个" },
        ],
      },
      {
        category: "蔬菜",
        items: [
          { name: "芥兰", amount: "半斤", search_keywords: ["芥兰", "芥蓝"] },
          { name: "丝瓜", amount: "1 根" },
        ],
      },
    ],
    cooking_order: [
      "梅菜扣肉按包装蒸 20 分钟（放最下层蒸锅）",
      "煮米饭",
      "虾仁腌制，鸡蛋打散",
      "烧水焯芥兰，捞出淋生抽蒜油",
      "炒虾仁滑蛋",
      "最后煮丝瓜蛋花汤",
    ],
    reason: "半成品扣肉 + 自炒虾仁滑蛋，省力又体面，适合周末犒劳自己。",
  };

  return [planA, planB, thirdType === "孩子老人友好型" ? planC_Kid : planC_Upgrade].map(
    (plan) => withCookingSchedule(withRecipeSteps(plan), req)
  );
}
