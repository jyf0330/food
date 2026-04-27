export const DISH_ENGAGEMENT_KEY = "san-zhuo-cai:dish-engagement";

export type DishEngagement = {
  liked: string[];
  saved: string[];
};

type EngagementStorage = Pick<Storage, "getItem" | "setItem">;

const normalizeDishNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 48);
};

const normalizeEngagement = (value: unknown): DishEngagement => {
  if (!value || typeof value !== "object") return { liked: [], saved: [] };
  const data = value as Partial<DishEngagement>;

  return {
    liked: normalizeDishNames(data.liked),
    saved: normalizeDishNames(data.saved),
  };
};

export function readDishEngagement(storage: Pick<Storage, "getItem">): DishEngagement {
  try {
    return normalizeEngagement(JSON.parse(storage.getItem(DISH_ENGAGEMENT_KEY) ?? "null"));
  } catch {
    return { liked: [], saved: [] };
  }
}

export function writeDishEngagement(
  storage: Pick<Storage, "setItem">,
  engagement: DishEngagement
): DishEngagement {
  const next = normalizeEngagement(engagement);
  storage.setItem(DISH_ENGAGEMENT_KEY, JSON.stringify(next));
  return next;
}

export function toggleDishEngagement(
  storage: EngagementStorage,
  key: keyof DishEngagement,
  dishName: string
): DishEngagement {
  const name = dishName.trim();
  const current = readDishEngagement(storage);
  const existing = current[key];
  const nextList = existing.includes(name)
    ? existing.filter((item) => item !== name)
    : [...existing, name];

  return writeDishEngagement(storage, {
    ...current,
    [key]: nextList,
  });
}
