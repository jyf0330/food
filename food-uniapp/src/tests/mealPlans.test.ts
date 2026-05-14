import { describe, expect, it } from "vitest";
import { buildGenerateResponse } from "@/domain/mealPlans";
import { DEFAULT_GENERATE_REQUEST } from "@/domain/resultUrl";

describe("meal plans", () => {
  it("builds first plan from selected dishes in home selection order", () => {
    const selected = ["蒜蓉菜心", "番茄炒蛋", "不存在的菜", "土豆焖鸡"];
    const response = buildGenerateResponse({
      ...DEFAULT_GENERATE_REQUEST,
      selected_dishes: selected,
      favorite_foods: selected,
      variant: 1,
    });

    expect(response.plans).toHaveLength(3);
    expect(response.plans[0].dishes.map((dish) => dish.name)).toEqual(["蒜蓉菜心", "番茄炒蛋", "土豆焖鸡"]);
    expect(response.plans[0].shopping_list.length).toBeGreaterThan(0);
    expect(response.plans[0].dishes.every((dish) => (dish.steps?.length ?? 0) > 0)).toBe(true);
  });

  it("variant changes generated recommendations", () => {
    const selected = ["番茄炒蛋"];
    const first = buildGenerateResponse({
      ...DEFAULT_GENERATE_REQUEST,
      selected_dishes: selected,
      favorite_foods: selected,
      variant: 1,
    });
    const second = buildGenerateResponse({
      ...DEFAULT_GENERATE_REQUEST,
      selected_dishes: selected,
      favorite_foods: selected,
      variant: 2,
    });

    expect(second.plans[1].dishes.map((dish) => dish.name)).not.toEqual(first.plans[1].dishes.map((dish) => dish.name));
  });

  it("daily recommendations come from migrated ingredient data", () => {
    const response = buildGenerateResponse(DEFAULT_GENERATE_REQUEST);

    expect(response.daily_recommended.length).toBeGreaterThan(0);
    expect(response.daily_not_recommended.length).toBeGreaterThan(0);
  });
});
