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
    assert.ok(dishes.length >= 170, `expected 170+ dishes, got ${dishes.length}`);
    assert.ok(
      ingredients.length >= 120,
      `expected 120+ ingredients, got ${ingredients.length}`
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

  it("includes common supermarket vegetables and recipes from the expanded platform pool", () => {
    const ingredientNames = ingredients.map((item) => item.standard_name);
    const dishNames = dishes.map((item) => item.dish_name);

    for (const name of ["大白菜", "茼蒿", "西葫芦", "口蘑", "五花肉", "鲫鱼"]) {
      assert.ok(ingredientNames.includes(name), `missing expanded ingredient ${name}`);
    }

    for (const name of ["白菜豆腐汤", "西葫芦炒蛋", "鲫鱼豆腐汤", "蒜苗炒五花肉"]) {
      assert.ok(dishNames.includes(name), `missing expanded recipe ${name}`);
    }
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

  it("covers enough higher-priced foods for upgrade and avoid-buy guidance", () => {
    const expensivePriceNames = priceBaseline
      .filter((item) => item.current_price >= item.expensive_threshold)
      .map((item) => item.name);
    const highCostDishNames = dishes
      .filter((dish) => dish.estimated_cost_level === "高")
      .map((dish) => dish.dish_name);

    assert.ok(
      expensivePriceNames.length >= 18,
      `expected 18+ expensive price rows, got ${expensivePriceNames.length}: ${expensivePriceNames.join("、")}`
    );
    assert.ok(
      ["牛肉", "羊肉", "牛腩", "大黄花鱼", "带鱼", "鲈鱼", "桂花鱼", "基围虾"].every(
        (name) => expensivePriceNames.includes(name)
      ),
      `missing expected premium price names: ${expensivePriceNames.join("、")}`
    );
    assert.ok(
      highCostDishNames.length >= 16,
      `expected 16+ high-cost dishes, got ${highCostDishNames.length}: ${highCostDishNames.join("、")}`
    );
  });

  it("covers the official basket-monitor foods and practical recipes for cookable items", () => {
    const basketFoods = [
      "猪肉",
      "牛肉",
      "羊肉",
      "鸡蛋",
      "白条鸡",
      "鲫鱼",
      "鲤鱼",
      "白鲢鱼",
      "大带鱼",
      "草鱼",
      "花鲢鱼",
      "大黄花鱼",
      "大白菜",
      "油菜",
      "芹菜",
      "菠菜",
      "韭菜",
      "洋白菜",
      "胡萝卜",
      "白萝卜",
      "土豆",
      "葱头",
      "大葱",
      "生姜",
      "大蒜",
      "莴笋",
      "莲藕",
      "蒜薹",
      "西葫芦",
      "冬瓜",
      "豆角",
      "茄子",
      "南瓜",
      "西红柿",
      "青椒",
      "黄瓜",
      "苦瓜",
      "菜花",
      "平菇",
      "香菇",
      "西瓜",
      "香蕉",
      "鸭梨",
      "富士苹果",
      "菠萝",
      "巨峰葡萄",
    ];
    const ingredientNames = new Set(ingredients.map((item) => item.standard_name));
    const priceNames = new Set(priceBaseline.map((item) => item.name));
    const dishIngredientNames = new Set(dishes.flatMap((dish) => dish.main_ingredients));
    const cookableBasketFoods = basketFoods.filter(
      (name) => !["西瓜", "香蕉", "鸭梨", "富士苹果", "菠萝", "巨峰葡萄"].includes(name)
    );

    assert.deepEqual(
      basketFoods.filter((name) => !ingredientNames.has(name)),
      [],
      "all basket foods should exist in the ingredient library"
    );
    assert.deepEqual(
      basketFoods.filter((name) => !priceNames.has(name)),
      [],
      "all basket foods should exist in the price baseline"
    );
    assert.deepEqual(
      cookableBasketFoods.filter((name) => !dishIngredientNames.has(name)),
      [],
      "cookable basket foods should appear in at least one dish"
    );
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
