import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_COUNT,
  HOME_DISH_POOL,
  dailyHomeDishNames,
  homeDishesFromNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes,
} from "@/domain/homeDishes";

describe("home dishes", () => {
  it("uses the full migrated dish catalog", () => {
    expect(HOME_DISH_POOL).toHaveLength(302);
    expect(homeDishesFromNames(DEFAULT_HOME_DISH_NAMES)).toHaveLength(HOME_DISH_COUNT);
  });

  it("searches beyond the default visible list", () => {
    const defaultDishes = homeDishesFromNames(DEFAULT_HOME_DISH_NAMES);
    const hiddenMatch = searchHomeDishes(HOME_DISH_POOL, "鸡翅");

    expect(defaultDishes.some((dish) => dish.searchKeywords.some((keyword) => keyword.includes("鸡翅")))).toBe(false);
    expect(hiddenMatch.length).toBeGreaterThan(0);
  });

  it("keeps daily home dishes stable for a day and different across days", () => {
    const firstDay = dailyHomeDishNames(new Date(2026, 4, 15));
    const sameDay = dailyHomeDishNames(new Date(2026, 4, 15, 20));
    const nextDay = dailyHomeDishNames(new Date(2026, 4, 16));

    expect(firstDay).toHaveLength(HOME_DISH_COUNT);
    expect(firstDay).toEqual(sameDay);
    expect(firstDay).not.toEqual(nextDay);
  });

  it("refresh keeps selected dishes and changes unselected dishes", () => {
    const selected = DEFAULT_HOME_DISH_NAMES.slice(0, 2);
    const refreshed = refreshUnselectedHomeDishes(DEFAULT_HOME_DISH_NAMES, selected, 37);

    expect(refreshed.slice(0, 2)).toEqual(selected);
    expect(refreshed.slice(2)).not.toEqual(DEFAULT_HOME_DISH_NAMES.slice(2));
    expect(new Set(refreshed).size).toBe(HOME_DISH_COUNT);
  });
});
