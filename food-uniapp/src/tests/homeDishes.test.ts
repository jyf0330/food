import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_POOL,
  homeDishesFromNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes,
} from "@/domain/homeDishes";

describe("home dishes", () => {
  it("uses the full migrated dish catalog", () => {
    expect(HOME_DISH_POOL).toHaveLength(302);
    expect(homeDishesFromNames(DEFAULT_HOME_DISH_NAMES)).toHaveLength(12);
  });

  it("searches beyond the default visible list", () => {
    const defaultDishes = homeDishesFromNames(DEFAULT_HOME_DISH_NAMES);
    const hiddenMatch = searchHomeDishes(HOME_DISH_POOL, "鸡翅");

    expect(defaultDishes.some((dish) => dish.searchKeywords.some((keyword) => keyword.includes("鸡翅")))).toBe(false);
    expect(hiddenMatch.length).toBeGreaterThan(0);
  });

  it("refresh keeps selected dishes and changes unselected dishes", () => {
    const selected = DEFAULT_HOME_DISH_NAMES.slice(0, 4);
    const refreshed = refreshUnselectedHomeDishes(DEFAULT_HOME_DISH_NAMES, selected, 37);

    expect(refreshed.slice(0, 4)).toEqual(selected);
    expect(refreshed.slice(4)).not.toEqual(DEFAULT_HOME_DISH_NAMES.slice(4));
    expect(new Set(refreshed).size).toBe(12);
  });
});
