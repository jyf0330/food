import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMealPlanCopyText } from "./mealPlanText";
import type { MealPlan } from "./types";

const plan: MealPlan = {
  type: "营养均衡型",
  title: "番茄炒蛋 + 蒜蓉菜心",
  estimated_cost: 68,
  total_time: 35,
  suitable_for: ["工作日", "家常"],
  dishes: [
    {
      name: "番茄炒蛋",
      reason: "快手下饭",
      ingredients: [
        { name: "番茄", amount: "3 个" },
        { name: "鸡蛋", amount: "4 个" },
      ],
      steps: ["番茄切块，鸡蛋打散。", "先炒蛋再炒番茄，合锅调味。"],
      tips: ["鸡蛋别炒老。"],
    },
  ],
  shopping_list: [
    {
      category: "肉蛋",
      items: [{ name: "鸡蛋", amount: "4 个" }],
    },
    {
      category: "蔬菜",
      items: [{ name: "番茄", amount: "3 个" }],
    },
  ],
  cooking_order: ["先洗米煮饭", "再炒番茄炒蛋"],
  cooking_schedule: [
    { time: "18:25", task: "开始备菜" },
    { time: "19:00", task: "完成收尾，上桌开饭" },
  ],
  reason: "按你选择的菜生成。",
};

describe("formatMealPlanCopyText", () => {
  it("formats a readable recipe with menu, shopping list and cooking steps", () => {
    const text = formatMealPlanCopyText(plan);

    assert.match(text, /^今天吃什么：番茄炒蛋 \+ 蒜蓉菜心/);
    assert.match(text, /【菜单】\n1\. 番茄炒蛋 - 快手下饭/);
    assert.match(text, /【买菜清单】\n肉蛋：鸡蛋 4 个\n蔬菜：番茄 3 个/);
    assert.match(text, /【按点上桌】\n18:25 - 开始备菜\n19:00 - 完成收尾，上桌开饭/);
    assert.match(text, /【每道菜做法】\n## 番茄炒蛋\n\n材料：番茄 3 个、鸡蛋 4 个/);
    assert.match(text, /做法：\n1\. 番茄切块，鸡蛋打散。/);
    assert.match(text, /小技巧：\n- 鸡蛋别炒老。/);
  });
});
