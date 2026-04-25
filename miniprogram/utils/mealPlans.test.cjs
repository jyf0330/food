const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { buildGenerateResponse } = require("./mealPlans");

const baseRequest = {
  city: "深圳",
  people_count: 4,
  has_child: true,
  has_elder: true,
  budget: 80,
  meal_type: "晚餐",
  taste: ["清淡", "不辣"],
  avoid: [],
  time_limit: 40,
  finish_time: "12:00",
  cook_speed: "slow",
  shopping_channel: "菜市场",
  kitchen_tools: ["炒锅", "电饭锅"],
};

describe("mini program meal plan generator", () => {
  it("returns three usable plans with recipes and a noon schedule", () => {
    const response = buildGenerateResponse(baseRequest);

    assert.equal(response.plans.length, 3);
    assert.equal(response.plans[2].type, "孩子老人友好型");
    assert.ok(response.daily_recommended.includes("菜心"));
    assert.ok(
      response.daily_recommended.some((name) => ["番茄", "青瓜", "生菜", "上海青"].includes(name))
    );

    for (const plan of response.plans) {
      assert.ok(plan.cooking_schedule.length >= 4);
      assert.equal(plan.cooking_schedule.at(-1).time, "12:00");
      assert.match(plan.cooking_schedule.at(-1).task, /开饭|上桌|完成/);

      for (const dish of plan.dishes) {
        assert.ok(dish.steps.length >= 3, `${dish.name} should include recipe steps`);
        assert.match(dish.steps[0], /目标是/);
        assert.ok(
          dish.steps.some((step) => /看到|如果|别|不要|判断/.test(step)),
          `${dish.name} should include cooking judgment`
        );
        assert.ok(
          dish.tips.some((tip) => /关键点|孩子|老人|新手|替换/.test(tip)),
          `${dish.name} should include practical tips`
        );
        assert.doesNotMatch(
          dish.steps.join(" "),
          /鸡蛋.*切|蛋.*切好/,
          `${dish.name} should not use awkward prep wording for eggs`
        );
        if (!dish.name.includes("鱼")) {
          assert.doesNotMatch(
            dish.steps.join(" "),
            /鱼眼/,
            `${dish.name} should not mention fish doneness cues`
          );
        }
        if (dish.category === "素菜") {
          assert.doesNotMatch(
            `${dish.steps.join(" ")} ${dish.tips.join(" ")}`,
            /骨刺|骨头|鱼刺|肉类/,
            `${dish.name} should not include meat or fish reminders in vegetable guidance`
          );
        }
      }
    }
  });

  it("can swap to another table with the same conditions", () => {
    const first = buildGenerateResponse({ ...baseRequest, variant: 0 });
    const swapped = buildGenerateResponse({ ...baseRequest, variant: 1 });
    const firstNames = first.plans.flatMap((plan) => plan.dishes.map((dish) => dish.name));
    const swappedNames = swapped.plans.flatMap((plan) => plan.dishes.map((dish) => dish.name));

    assert.notDeepEqual(swappedNames, firstNames);
  });
});
