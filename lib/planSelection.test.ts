import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recommendedInitialPlanIndex } from "./planSelection";
import type { MealPlan } from "./types";

const plans = [
  { type: "省钱快手型", estimated_cost: 52 },
  { type: "营养均衡型", estimated_cost: 88 },
  { type: "改善伙食型", estimated_cost: 138 },
] as MealPlan[];

describe("recommendedInitialPlanIndex", () => {
  it("does not default high budget users to the cheapest plan", () => {
    assert.equal(recommendedInitialPlanIndex(plans, 200), 2);
  });

  it("keeps budget-focused users on the cheapest plan", () => {
    assert.equal(recommendedInitialPlanIndex(plans, 80), 0);
  });
});
