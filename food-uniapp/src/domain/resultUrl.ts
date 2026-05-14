import type { GenerateRequest } from "./types";

export const DEFAULT_GENERATE_REQUEST: GenerateRequest = {
  city: "深圳",
  people_count: 3,
  has_child: true,
  has_elder: false,
  budget: 80,
  meal_type: "午餐",
  taste: ["清淡", "不辣"],
  avoid: [],
  time_limit: 40,
  finish_time: "12:00",
  cook_speed: "slow",
  shopping_channel: "菜市场",
  kitchen_tools: ["炒锅", "电饭锅"],
};

export type ResultQuery = GenerateRequest & {
  planIndex?: number;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => safeDecode(item).trim())
    .filter(Boolean);
}

function encodeList(value: string[] | undefined): string {
  return (value ?? []).map((item) => encodeURIComponent(item)).join(",");
}

function queryPair(key: string, value: string | number | undefined): string {
  return `${key}=${encodeURIComponent(String(value ?? ""))}`;
}

function listPair(key: string, value: string[] | undefined): string {
  return `${key}=${encodeList(value)}`;
}

export function buildResultPageUrl(params: Partial<ResultQuery>): string {
  const merged: ResultQuery = { ...DEFAULT_GENERATE_REQUEST, ...params };
  const query = [
    listPair("selectedDishes", merged.selected_dishes),
    queryPair("people", merged.people_count),
    queryPair("family", merged.has_child ? "child" : merged.has_elder ? "elder" : "adult"),
    queryPair("budget", merged.budget),
    queryPair("time", merged.time_limit),
    listPair("taste", merged.taste),
    queryPair("channel", merged.shopping_channel),
    listPair("avoid", merged.avoid),
    queryPair("finishTime", merged.finish_time),
    queryPair("cookSpeed", merged.cook_speed ?? "normal"),
    listPair("favoriteFoods", merged.favorite_foods ?? merged.selected_dishes),
    queryPair("variant", merged.variant ?? 0),
  ];

  if (merged.planIndex !== undefined) query.push(queryPair("planIndex", merged.planIndex));

  return `/pages/result/result?${query.join("&")}`;
}

export function parseResultQuery(options: Record<string, string | string[] | undefined>): ResultQuery {
  const selectedDishes = parseList(firstValue(options.selectedDishes));
  const family = safeDecode(firstValue(options.family));
  const cookSpeed = safeDecode(firstValue(options.cookSpeed));
  const planIndexValue = firstValue(options.planIndex);

  return {
    ...DEFAULT_GENERATE_REQUEST,
    people_count: parseNumber(firstValue(options.people), DEFAULT_GENERATE_REQUEST.people_count),
    has_child: family === "child",
    has_elder: family === "elder",
    budget: parseNumber(firstValue(options.budget), DEFAULT_GENERATE_REQUEST.budget),
    taste: parseList(firstValue(options.taste)) || DEFAULT_GENERATE_REQUEST.taste,
    avoid: parseList(firstValue(options.avoid)),
    time_limit: parseNumber(firstValue(options.time), DEFAULT_GENERATE_REQUEST.time_limit),
    finish_time: safeDecode(firstValue(options.finishTime)) || DEFAULT_GENERATE_REQUEST.finish_time,
    cook_speed: cookSpeed === "beginner" || cookSpeed === "slow" ? cookSpeed : "normal",
    selected_dishes: selectedDishes,
    favorite_foods: parseList(firstValue(options.favoriteFoods)),
    shopping_channel: safeDecode(firstValue(options.channel)) || DEFAULT_GENERATE_REQUEST.shopping_channel,
    variant: parseNumber(firstValue(options.variant), 0),
    planIndex: planIndexValue ? parseNumber(planIndexValue, 0) : undefined,
  };
}

export function withResultPlanIndex(href: string, planIndex: number): string {
  const [path, rawQuery = ""] = href.split("?", 2);
  const query = rawQuery
    .split("&")
    .filter((part) => part && !part.startsWith("planIndex="));
  query.push(queryPair("planIndex", planIndex));
  return `${path}?${query.join("&")}`;
}
