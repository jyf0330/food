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

  it("uses a higher budget to make the upgrade plan feel upgraded", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      has_child: false,
      has_elder: false,
      budget: 200,
      time_limit: 60,
    });
    const upgradePlan = response.plans.find((plan) => plan.type === "改善伙食型");

    assert.ok(upgradePlan, "expected an upgrade plan for adult-only high budget dinners");
    assert.ok(
      upgradePlan.estimated_cost >= 110,
      `expected high budget upgrade plan to cost at least 110, got ${upgradePlan.estimated_cost}`
    );
    assert.ok(
      upgradePlan.dishes.some((dish) =>
        /牛腩|桂花鱼|蒸虾|扇贝|牛肉粒|豉汁蒸排骨/.test(dish.name)
      ),
      "expected the high budget upgrade plan to include a more premium main dish"
    );
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

  it("turns recipes into template-style cooking guidance", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      has_elder: true,
      finish_time: "12:00",
      cook_speed: "beginner",
    });

    for (const plan of response.plans) {
      for (const dish of plan.dishes) {
        assert.match(dish.steps?.[0] ?? "", /^关键点：/);
        assert.ok(
          dish.steps?.some((step) => /^材料：/.test(step)),
          `${dish.name} should include a material line`
        );
        assert.ok(
          dish.steps?.some((step) => /^处理：/.test(step)),
          `${dish.name} should include prep guidance`
        );
        assert.ok(
          dish.steps?.some((step) => /^下锅：/.test(step)),
          `${dish.name} should include cooking guidance`
        );
        assert.ok(
          dish.steps?.some((step) => /^判断：/.test(step)),
          `${dish.name} should include doneness guidance`
        );
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

  it("uses the liver soup template for pork liver dishes", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      selected_dishes: ["猪肝菠菜汤"],
    } as GenerateRequest & { selected_dishes: string[] });
    const text = response.plans[0].dishes[0].steps?.join("\n") ?? "";

    assert.match(text, /泡出血水|20.?30 分钟/);
    assert.match(text, /料酒|淀粉|食用油|白胡椒/);
    assert.match(text, /一片片|不要一坨/);
    assert.match(text, /30 秒.?1 分钟|变色后/);
    assert.doesNotMatch(text, /肉类先焯水/);
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

  it("uses selected home page dishes to build the first recipe plan", () => {
    const response = buildGenerateResponse({
      ...baseRequest,
      selected_dishes: ["番茄炒蛋", "蒜蓉菜心", "紫菜蛋花汤"],
    } as GenerateRequest & { selected_dishes: string[] });

    assert.deepEqual(
      response.plans[0].dishes.map((dish) => dish.name),
      ["番茄炒蛋", "蒜蓉菜心", "紫菜蛋花汤"]
    );
    assert.match(response.plans[0].reason, /你在首页选/);
  });
});
