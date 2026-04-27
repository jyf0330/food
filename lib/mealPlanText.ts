import type { MealPlan } from "./types";

function formatItems(items: { name: string; amount: string }[]): string {
  return items.map((item) => `${item.name} ${item.amount}`).join("、");
}

function formatScheduleNode(node: NonNullable<MealPlan["cooking_schedule"]>[number]): string {
  return `${node.time} - ${node.task}`;
}

export function formatMealPlanCopyText(plan: MealPlan): string {
  const menu = plan.dishes
    .map((dish, index) => `${index + 1}. ${dish.name}${dish.reason ? ` - ${dish.reason}` : ""}`)
    .join("\n");
  const shoppingList = plan.shopping_list
    .map((group) => `${group.category}：${formatItems(group.items)}`)
    .join("\n");
  const schedule = plan.cooking_schedule?.length
    ? plan.cooking_schedule.map(formatScheduleNode).join("\n")
    : plan.cooking_order.map((step, index) => `${index + 1}. ${step}`).join("\n");
  const recipes = plan.dishes
    .map((dish) => {
      const embeddedMaterial = dish.steps?.find((step) => /^材料：/.test(step));
      const material = dish.ingredients?.length
        ? `材料：${formatItems(dish.ingredients)}`
        : embeddedMaterial;
      const steps = (dish.steps ?? [])
        .filter((step) => !/^材料：/.test(step))
        .map((step, index) => `${index + 1}. ${step}`)
        .join("\n");
      const tips = dish.tips?.length
        ? `\n\n小技巧：\n${dish.tips.map((tip) => `- ${tip}`).join("\n")}`
        : "";

      const parts = [`## ${dish.name}`];
      if (material) parts.push(material);
      if (steps) parts.push(`做法：\n${steps}`);

      return parts.join("\n\n") + tips;
    })
    .join("\n\n");

  return [
    `今天吃什么：${plan.title}`,
    `类型：${plan.type}`,
    `预计：约 ${plan.estimated_cost} 元 / ${plan.total_time} 分钟 / ${plan.dishes.length} 道菜`,
    "",
    "【菜单】",
    menu,
    "",
    "【买菜清单】",
    shoppingList,
    "",
    "【按点上桌】",
    schedule,
    "",
    "【每道菜做法】",
    recipes,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}
