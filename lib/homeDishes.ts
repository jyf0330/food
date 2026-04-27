import dishesSeed from "@/data/dishes.seed.json";

export type HomeDish = {
  name: string;
  category: string;
  time: number;
  note: string;
};

type SeedDish = (typeof dishesSeed)[number];

export const DEFAULT_HOME_DISH_NAMES = [
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

const noteForDish = (dish: SeedDish) => {
  const taste = dish.taste?.[0] ?? "家常";
  if (dish.time_minutes <= 12) return `${taste}快手`;
  if (dish.category === "汤") return "热乎有汤";
  if (dish.kid_friendly && dish.elder_friendly) return "老少友好";
  return `${taste}下饭`;
};

export const HOME_DISH_POOL: HomeDish[] = (dishesSeed as SeedDish[]).map((dish) => ({
  name: dish.dish_name,
  category: dish.category,
  time: dish.time_minutes,
  note: noteForDish(dish),
}));

const dishByName = new Map(HOME_DISH_POOL.map((dish) => [dish.name, dish]));

export function homeDishesFromNames(names: string[]): HomeDish[] {
  return names.map((name) => dishByName.get(name)).filter((dish): dish is HomeDish => Boolean(dish));
}

function rotatePool(seed: number): HomeDish[] {
  const offset = Math.abs(Math.floor(seed)) % HOME_DISH_POOL.length;
  return HOME_DISH_POOL.slice(offset).concat(HOME_DISH_POOL.slice(0, offset));
}

export function refreshUnselectedHomeDishes(
  currentNames: string[],
  selectedNames: string[],
  seed: number
): string[] {
  const selected = new Set(selectedNames);
  const nextNames = new Set(currentNames.filter((name) => selected.has(name)));
  const rotated = rotatePool(seed);
  let cursor = 0;

  return currentNames.map((name) => {
    if (selected.has(name)) {
      return name;
    }

    while (cursor < rotated.length) {
      const candidate = rotated[cursor++];
      if (!nextNames.has(candidate.name)) {
        nextNames.add(candidate.name);
        return candidate.name;
      }
    }

    return name;
  });
}
