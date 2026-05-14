const { dishes } = require("./curatedData");

const DEFAULT_HOME_DISH_NAMES = [
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
  "家常豆腐"
];

function noteForDish(dish) {
  const taste = dish.taste && dish.taste[0] ? dish.taste[0] : "家常";
  if (dish.time_minutes <= 12) return `${taste}快手`;
  if (dish.category === "汤") return "热乎有汤";
  if (dish.kid_friendly && dish.elder_friendly) return "老少友好";
  return `${taste}下饭`;
}

function compactSearchText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function searchKeywordsForDish(dish, note) {
  return [
    dish.dish_name,
    dish.category,
    dish.cuisine,
    note,
    ...(dish.taste || []),
    ...(dish.main_ingredients || []),
    ...(dish.optional_ingredients || []),
    ...(dish.region_style || []),
    ...(dish.suitable_people || []),
    ...(dish.cooking_methods || []),
    ...(dish.avoid_tags || [])
  ].filter(Boolean).map(compactSearchText);
}

const HOME_DISH_POOL = dishes.map((dish) => {
  const note = noteForDish(dish);
  return {
    name: dish.dish_name,
    category: dish.category,
    time: dish.time_minutes,
    note,
    searchKeywords: searchKeywordsForDish(dish, note)
  };
});

const dishByName = new Map(HOME_DISH_POOL.map((dish) => [dish.name, dish]));
const knownHomeDishNames = new Set(HOME_DISH_POOL.map((dish) => dish.name));

function homeDishesFromNames(names) {
  return names.map((name) => dishByName.get(name)).filter(Boolean);
}

function normalizeHomeDishNames(value, fallback, options = {}) {
  if (!Array.isArray(value)) return fallback;
  const names = Array.from(
    new Set(
      value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter((name) => knownHomeDishNames.has(name))
    )
  ).slice(0, options.limit || DEFAULT_HOME_DISH_NAMES.length);
  return names.length || options.allowEmpty ? names : fallback;
}

function searchHomeDishes(sourceDishes, query) {
  const keywords = String(query || "")
    .split(/\s+/)
    .map(compactSearchText)
    .filter(Boolean);
  if (!keywords.length) return sourceDishes;

  return sourceDishes.filter((dish) =>
    keywords.every((keyword) =>
      dish.searchKeywords.some((value) => value.includes(keyword))
    )
  );
}

function rotatePool(seed) {
  const offset = Math.abs(Math.floor(seed)) % HOME_DISH_POOL.length;
  return HOME_DISH_POOL.slice(offset).concat(HOME_DISH_POOL.slice(0, offset));
}

function refreshUnselectedHomeDishes(currentNames, selectedNames, seed) {
  const selected = new Set(selectedNames);
  const nextNames = new Set(currentNames.filter((name) => selected.has(name)));
  const rotated = rotatePool(seed);
  let cursor = 0;

  return currentNames.map((name) => {
    if (selected.has(name)) return name;

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

module.exports = {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_POOL,
  homeDishesFromNames,
  normalizeHomeDishNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes
};
