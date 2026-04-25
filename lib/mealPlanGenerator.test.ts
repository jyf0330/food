import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGenerateResponse } from "./mealPlanGenerator";
import type { GenerateRequest } from "./types";

const baseRequest: GenerateRequest = {
  city: "深圳",
  people_count: 3,
  has_child: true,
  has_elder: false,
  budget: 80,
  meal_type: "晚餐",
  taste: ["清淡", "不辣"],
  avoid: [],
  time_limit: 40,
  shopping_channel: "菜市场",
  kitchen_tools: ["炒锅", "电饭锅"],
};

describe("buildGenerateResponse", () => {
  it("returns three meal plans with daily shopping guidance", () => {
    const response = buildGenerateResponse(baseRequest);

    assert.equal(response.plans.length, 3);
    assert.equal(response.plans[2].type, "孩子老人友好型");
    assert.ok(response.daily_recommended.includes("菜心"));
    assert.ok(
      response.daily_recommended.some((name) => ["番茄", "青瓜", "生菜", "上海青"].includes(name))
    );
    assert.ok(
      response.daily_not_recommended.some(
        (item) => item.name === "排骨" && item.reason.length > 0
      )
    );
  });

  it("uses an upgrade plan when there are no children or elders", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      has_child: false,
      has_elder: false,
    });

    assert.equal(response.plans[2].type, "改善伙食型");
  });

  it("can swap to another table with the same conditions", () => {
    const first = buildGenerateResponse({ ...baseRequest, variant: 0 });
    const swapped = buildGenerateResponse({ ...baseRequest, variant: 1 });
    const firstNames = first.plans.flatMap((plan) => plan.dishes.map((dish) => dish.name));
    const swappedNames = swapped.plans.flatMap((plan) => plan.dishes.map((dish) => dish.name));

    assert.notDeepEqual(swappedNames, firstNames);
  });

  it("recommends one favorite food on a deterministic half of days", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      favorite_foods: ["豆腐"],
      recommendation_date: "2026-04-27",
      user_id: "jtcsm_tester",
    } as GenerateRequest);

    const dishes = response.plans.flatMap((plan) => plan.dishes);

    assert.ok(
      dishes.some((dish) => dish.name.includes("豆腐")),
      "expected a tofu dish to be recommended on a favorite day"
    );
    assert.ok(
      dishes.some((dish) => dish.reason.includes("喜欢")),
      "expected the favorite dish to explain why it was picked"
    );
  });

  it("does not force favorite foods on the other half of days", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      favorite_foods: ["豆腐"],
      recommendation_date: "2026-04-25",
      user_id: "jtcsm_tester",
    } as GenerateRequest);
    const names = response.plans.flatMap((plan) => plan.dishes.map((dish) => dish.name));

    assert.ok(
      names.every((name) => !name.includes("豆腐")),
      "expected tofu to stay out of the menu on a non-favorite day"
    );
  });

  it("includes detailed cooking steps for every dish", () => {
    const response = buildGenerateResponse(baseRequest);

    for (const plan of response.plans) {
      for (const dish of plan.dishes) {
        assert.ok(dish.steps, `${dish.name} is missing cooking steps`);
        assert.ok(
          dish.steps.length >= 3,
          `${dish.name} should include enough cooking steps`
        );
      }
    }
  });

  it("turns recipes into coaching-style cooking guidance", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      has_elder: true,
      finish_time: "12:00",
      cook_speed: "beginner",
    });

    for (const plan of response.plans) {
      for (const dish of plan.dishes) {
        assert.match(dish.steps?.[0] ?? "", /目标是/);
        assert.ok(
          dish.steps?.some((step) => /看到|如果|别|不要|判断/.test(step)),
          `${dish.name} should explain how to judge doneness or avoid mistakes`
        );
        assert.ok(
          dish.tips?.some((tip) => /关键点|孩子|老人|新手|替换/.test(tip)),
          `${dish.name} should include practical coaching tips`
        );
        assert.doesNotMatch(
          dish.steps?.join(" ") ?? "",
          /鸡蛋.*切|蛋.*切好/,
          `${dish.name} should not use awkward prep wording for eggs`
        );
        if (!dish.name.includes("鱼")) {
          assert.doesNotMatch(
            dish.steps?.join(" ") ?? "",
            /鱼眼/,
            `${dish.name} should not mention fish doneness cues`
          );
        }
        if (dish.category === "素菜") {
          assert.doesNotMatch(
            `${dish.steps?.join(" ") ?? ""} ${dish.tips?.join(" ") ?? ""}`,
            /骨刺|骨头|鱼刺|肉类/,
            `${dish.name} should not include meat or fish reminders in vegetable guidance`
          );
        }
      }
    }
  });

  it("builds a cooking schedule backwards from the requested finish time for slower cooks", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      finish_time: "12:00",
      cook_speed: "slow",
    });

    for (const plan of response.plans) {
      assert.ok(plan.cooking_schedule, `${plan.title} is missing a cooking schedule`);
      assert.ok(
        plan.cooking_schedule.length >= 4 && plan.cooking_schedule.length <= 6,
        `${plan.title} should have 4-6 schedule nodes`
      );

      const finalNode = plan.cooking_schedule.at(-1);
      assert.equal(finalNode?.time, "12:00");
      assert.match(finalNode?.task ?? "", /开饭|上桌|完成/);
    }
  });
});
