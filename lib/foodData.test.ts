import assert from "node:assert/strict";
import { describe, it } from "node:test";
import dishes from "../data/dishes.seed.json";
import ingredients from "../data/ingredients.seed.json";
import nutrition from "../data/nutrition.seed.json";
import priceBaseline from "../data/price-baseline.json";
import { buildGenerateResponse } from "./mealPlanGenerator";
import { getDailyRecommended } from "./foodInsights";
import type { GenerateRequest } from "./types";

const baseRequest: GenerateRequest = {
  city: "深圳",
  people_count: 4,
  has_child: true,
  has_elder: true,
  budget: 100,
  meal_type: "晚餐",
  taste: ["清淡", "不辣"],
  avoid: [],
  time_limit: 45,
  finish_time: "12:00",
  cook_speed: "slow",
  shopping_channel: "菜市场",
  kitchen_tools: ["炒锅", "电饭锅"],
};

describe("curated food data", () => {
  it("contains a practical Shenzhen family dish and ingredient library", () => {
    assert.ok(dishes.length >= 100, `expected 100+ dishes, got ${dishes.length}`);
    assert.ok(
      ingredients.length >= 80,
      `expected 80+ ingredients, got ${ingredients.length}`
    );
    assert.ok(
      nutrition.length >= 60,
      `expected 60+ nutrition rows, got ${nutrition.length}`
    );
    assert.ok(
      priceBaseline.length >= 40,
      `expected 40+ price rows, got ${priceBaseline.length}`
    );
  });

  it("has original cooking steps and shopping amounts for every dish", () => {
    for (const dish of dishes) {
      assert.ok(dish.dish_name, "dish should have a name");
      assert.ok(dish.main_ingredients.length >= 1, `${dish.dish_name} needs ingredients`);
      assert.ok(dish.steps.length >= 3, `${dish.dish_name} needs original steps`);
      assert.ok(
        dish.shopping_amount_for_3_people?.length,
        `${dish.dish_name} needs shopping amounts`
      );
    }
  });

  it("generates meal plans from the curated library instead of a tiny fixed list", () => {
    const response = buildGenerateResponse(baseRequest);
    const dishNames = response.plans.flatMap((plan) =>
      plan.dishes.map((dish) => dish.name)
    );
    const uniqueNames = new Set(dishNames);

    assert.equal(response.plans.length, 3);
    assert.ok(uniqueNames.size >= 9, "three plans should not reuse the same few dishes");
    assert.ok(
      response.daily_recommended.length >= 6,
      "daily recommendations should come from richer ingredient data"
    );
    assert.ok(
      response.plans.every((plan) => plan.cooking_schedule?.at(-1)?.time === "12:00"),
      "plans should keep the requested finish time"
    );
  });

  it("prioritizes Shenzhen weekly seasonal produce with greenhouse backups", () => {
    const aprilWeekFourRecommendations = getDailyRecommended(new Date("2026-04-25T12:00:00+08:00"));

    assert.ok(
      aprilWeekFourRecommendations.slice(0, 6).includes("菜心"),
      "late April Shenzhen recommendations should keep seasonal choy sum near the front"
    );
    assert.ok(
      aprilWeekFourRecommendations.slice(0, 8).some((name) => ["番茄", "青瓜", "生菜", "上海青"].includes(name)),
      "weekly recommendations should allow stable greenhouse vegetables as backups"
    );
    assert.ok(
      aprilWeekFourRecommendations.length >= 6,
      "weekly recommendations should still provide enough choices"
    );
  });
});
