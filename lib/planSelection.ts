import type { MealPlan } from "./types";

export function recommendedInitialPlanIndex(plans: MealPlan[], budget: number): number {
  if (!plans.length) return 0;

  if (budget >= 150) {
    const upgradeIndex = plans.findIndex((plan) => plan.type === "改善伙食型");
    if (upgradeIndex >= 0) return upgradeIndex;

    return plans.reduce(
      (bestIndex, plan, index) =>
        plan.estimated_cost > plans[bestIndex].estimated_cost ? index : bestIndex,
      0
    );
  }

  if (budget >= 110) {
    const balancedIndex = plans.findIndex((plan) => plan.type === "营养均衡型");
    if (balancedIndex >= 0) return balancedIndex;
  }

  return 0;
}

export function initialPlanIndex(
  plans: MealPlan[],
  budget: number,
  selectedPlanIndex?: number
): number {
  if (
    selectedPlanIndex !== undefined &&
    Number.isInteger(selectedPlanIndex) &&
    selectedPlanIndex >= 0 &&
    selectedPlanIndex < plans.length
  ) {
    return selectedPlanIndex;
  }

  return recommendedInitialPlanIndex(plans, budget);
}
