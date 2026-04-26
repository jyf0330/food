import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LAST_CHOICE_KEY, rememberMealChoice, type MealMemoryForm } from "./mealMemory";

const form: MealMemoryForm = {
  people: 3,
  family: "child",
  budget: 80,
  time: 40,
  taste: ["清淡", "不辣"],
  channel: "菜市场",
  avoid: [],
  finishTime: "19:00",
  cookSpeed: "normal",
  userId: "小王",
  favoriteFoods: ["番茄炒蛋"],
};

describe("meal memory", () => {
  it("remembers the selected table as the last choice", () => {
    const writes = new Map<string, string>();

    const choice = rememberMealChoice(
      { setItem: (key, value) => writes.set(key, value) },
      {
        planIndex: 1,
        planTitle: "番茄炒蛋 + 清炒时蔬",
        planType: "营养均衡型",
        resultUrl: "/result?people=3",
        form,
        savedAt: "2026-04-27T10:00:00.000Z",
      }
    );

    assert.deepEqual(choice, {
      planIndex: 1,
      planTitle: "番茄炒蛋 + 清炒时蔬",
      planType: "营养均衡型",
      resultUrl: "/result?people=3&planIndex=1",
      form,
      savedAt: "2026-04-27T10:00:00.000Z",
    });
    assert.equal(writes.get(LAST_CHOICE_KEY), JSON.stringify(choice));
  });
});
