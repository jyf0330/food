import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_COUNT,
  HOME_DISH_POOL,
  getDailyHomeDishNames,
  homeDishesFromNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes,
} from "@/domain/homeDishes";

describe("home dishes", () => {
  it("uses the full migrated dish catalog", () => {
    expect(HOME_DISH_POOL).toHaveLength(302);
    expect(homeDishesFromNames(DEFAULT_HOME_DISH_NAMES)).toHaveLength(HOME_DISH_COUNT);
  });

  it("creates a different seven-dish default table by date", () => {
    const today = getDailyHomeDishNames(new Date("2026-05-15T12:00:00+08:00"));
    const tomorrow = getDailyHomeDishNames(new Date("2026-05-16T12:00:00+08:00"));

    expect(today).toHaveLength(HOME_DISH_COUNT);
    expect(new Set(today).size).toBe(HOME_DISH_COUNT);
    expect(tomorrow).toHaveLength(HOME_DISH_COUNT);
    expect(tomorrow).not.toEqual(today);
  });

  it("searches beyond the default visible list", () => {
    const defaultDishes = homeDishesFromNames(DEFAULT_HOME_DISH_NAMES);
    const hiddenMatch = searchHomeDishes(HOME_DISH_POOL, "鸡翅");

    expect(defaultDishes.some((dish) => dish.searchKeywords.some((keyword) => keyword.includes("鸡翅")))).toBe(false);
    expect(hiddenMatch.length).toBeGreaterThan(0);
  });

  it("refresh keeps selected dishes and changes unselected dishes", () => {
    const selected = DEFAULT_HOME_DISH_NAMES.slice(0, 2);
    const refreshed = refreshUnselectedHomeDishes(DEFAULT_HOME_DISH_NAMES, selected, 37);

    expect(refreshed.slice(0, 2)).toEqual(selected);
    expect(refreshed.slice(2)).not.toEqual(DEFAULT_HOME_DISH_NAMES.slice(2));
    expect(new Set(refreshed).size).toBe(HOME_DISH_COUNT);
  });
});
