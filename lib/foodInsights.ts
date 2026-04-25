import ingredients from "@/data/ingredients.seed.json";
import priceBaseline from "@/data/price-baseline.json";
import nutrition from "@/data/nutrition.seed.json";
import shenzhenSeason from "@/data/season-shenzhen.json";

type PriceRow = {
  name: string;
  current_price: number;
  normal_price: number;
  cheap_threshold: number;
  expensive_threshold: number;
};

const priceRows = priceBaseline as PriceRow[];
const nutritionRows = nutrition as { name: string; tags?: string[] }[];
const ingredientRows = ingredients as { standard_name: string; season_months: number[] }[];
const monthlySeason = shenzhenSeason.monthly as Record<string, string[]>;
const greenhouseBackups = ["番茄", "青瓜", "生菜", "上海青", "西兰花", "金针菇", "绿豆芽", "黄豆芽"];
const priceByName = new Map(priceRows.map((item) => [item.name, item]));

type PriceTier = "便宜" | "正常" | "偏贵" | "很贵";

function getChinaDateParts(date: Date): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  return {
    month: Number(parts.find((part) => part.type === "month")?.value ?? date.getMonth() + 1),
    day: Number(parts.find((part) => part.type === "day")?.value ?? date.getDate()),
  };
}

function uniqueNames(names: string[]): string[] {
  return Array.from(new Set(names)).filter(Boolean);
}

function getPriceTier(name: string): PriceTier {
  const row = priceByName.get(name);

  if (!row) {
    return "正常";
  }

  if (row.current_price <= row.cheap_threshold) {
    return "便宜";
  }

  if (row.current_price < row.expensive_threshold) {
    return "正常";
  }

  if (row.current_price < row.expensive_threshold * 1.2) {
    return "偏贵";
  }

  return "很贵";
}

function priceScore(name: string): number {
  const tier = getPriceTier(name);

  if (tier === "便宜") return 12;
  if (tier === "正常") return 4;
  if (tier === "偏贵") return -6;
  return -40;
}

function nextMonth(month: number): number {
  return month === 12 ? 1 : month + 1;
}

function weeklySeasonalNames(date = new Date()): string[] {
  const { month, day } = getChinaDateParts(date);
  const weekOfMonth = Math.min(4, Math.max(1, Math.ceil(day / 7)));
  const current = monthlySeason[String(month)] ?? [];
  const next = monthlySeason[String(nextMonth(month))] ?? [];
  const start = weekOfMonth - 1;

  return uniqueNames([...current.slice(start, start + 4), ...next.slice(0, Math.max(0, 6 - (current.length - start)))]);
}

export function getDailyRecommended(date = new Date()): string[] {
  const { month } = getChinaDateParts(date);
  const weeklySeasonalPriority = weeklySeasonalNames(date);
  const staples = ["鸡蛋", "豆腐", "鸡腿"];
  const cheapNames = priceRows
    .filter((item) => item.current_price <= item.cheap_threshold)
    .map((item) => item.name);
  const seasonalNames = ingredientRows
    .filter((item) => item.season_months.includes(month))
    .map((item) => item.standard_name);
  const nutritionNames = nutritionRows
    .filter((item) => item.tags?.some((tag) => ["高蛋白", "高纤维", "清淡汤水"].includes(tag)))
    .map((item) => item.name);

  const priority = new Map<string, number>();

  weeklySeasonalPriority.forEach((name, index) => priority.set(name, 120 - index * 4));
  greenhouseBackups.forEach((name, index) => priority.set(name, Math.max(priority.get(name) ?? 0, 70 - index * 2)));
  cheapNames.forEach((name) => priority.set(name, (priority.get(name) ?? 0) + 18));
  staples.forEach((name) => priority.set(name, Math.max(priority.get(name) ?? 0, 55)));
  seasonalNames.forEach((name) => priority.set(name, (priority.get(name) ?? 0) + 6));
  nutritionNames.forEach((name) => priority.set(name, (priority.get(name) ?? 0) + 4));

  return uniqueNames([
    ...weeklySeasonalPriority,
    ...greenhouseBackups,
    ...cheapNames,
    ...staples,
    ...seasonalNames,
    ...nutritionNames,
  ])
    .filter((name) => getPriceTier(name) !== "很贵")
    .sort((a, b) => (priority.get(b) ?? 0) + priceScore(b) - ((priority.get(a) ?? 0) + priceScore(a)))
    .slice(0, 8);
}

export function getDailyNotRecommended(): { name: string; reason: string }[] {
  const recommendedNames = new Set(getDailyRecommended());
  const expensive = priceRows
    .filter((item) => getPriceTier(item.name) === "很贵" || getPriceTier(item.name) === "偏贵")
    .filter((item) => !recommendedNames.has(item.name))
    .slice(0, 4)
    .map((item) => ({
      name: item.name,
      reason:
        getPriceTier(item.name) === "很贵"
          ? "今天价格明显高于本地基线，非刚需可先跳过"
          : "今天价格偏贵，想吃可以保留，预算紧时换同类食材",
    }));

  if (!expensive.some((item) => item.name === "排骨")) {
    expensive.unshift({
      name: "排骨",
      reason: "价格和烹饪时间都容易超预算，工作日可换鸡腿或肉末",
    });
  }

  return expensive.slice(0, 4);
}
