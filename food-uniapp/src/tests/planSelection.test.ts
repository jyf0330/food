import { describe, expect, it } from "vitest";
import { initialPlanIndex } from "@/domain/planSelection";
import type { MealPlan } from "@/domain/types";

const basePlan = (type: MealPlan["type"], estimatedCost: number): MealPlan => ({
  type,
  title: type,
  estimated_cost: estimatedCost,
  total_time: 30,
  suitable_for: [],
  dishes: [],
  shopping_list: [],
  cooking_order: [],
  reason: type,
});

describe("plan selection", () => {
  it("honors explicit selected plan index", () => {
    const plans = [basePlan("省钱快手型", 60), basePlan("营养均衡型", 90)];
    expect(initialPlanIndex(plans, 80, 1)).toBe(1);
  });

  it("chooses upgrade plan for high budget", () => {
    const plans = [
      basePlan("省钱快手型", 60),
      basePlan("营养均衡型", 90),
      basePlan("改善伙食型", 140),
    ];
    expect(initialPlanIndex(plans, 160)).toBe(2);
  });
});
