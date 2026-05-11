import type { MealPlan } from "./types";

function formatItems(items: { name: string; amount: string }[]): string {
  return items.map((item) => `${item.name} ${item.amount}`).join("、");
}

function formatScheduleNode(node: NonNullable<MealPlan["cooking_schedule"]>[number]): string {
  return `${node.time} - ${node.task}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderList(items: string[], ordered = false): string {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
}

function formatDishMaterials(dish: MealPlan["dishes"][number]): string | undefined {
  const embeddedMaterial = dish.steps?.find((step) => /^材料：/.test(step));
  if (dish.ingredients?.length) return `材料：${formatItems(dish.ingredients)}`;
  return embeddedMaterial;
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

export function formatMealPlanCopyHtml(plan: MealPlan): string {
  const schedule = plan.cooking_schedule?.length
    ? plan.cooking_schedule.map(formatScheduleNode)
    : plan.cooking_order;
  const recipes = plan.dishes
    .map((dish) => {
      const material = formatDishMaterials(dish);
      const steps = (dish.steps ?? []).filter((step) => !/^材料：/.test(step));
      const tips = dish.tips?.length
        ? `<div class="tips"><strong>小技巧</strong>${renderList(dish.tips)}</div>`
        : "";

      return `<section class="recipe"><h3>${escapeHtml(dish.name)}</h3>${
        material ? `<p class="material">${escapeHtml(material)}</p>` : ""
      }${steps.length ? renderList(steps, true) : ""}${tips}</section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>今天吃什么：${escapeHtml(plan.title)}</title>
  <style>
    body{margin:0;background:#fff8f2;color:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}
    main{max-width:760px;margin:0 auto;padding:28px 18px 40px}
    h1{margin:0 0 8px;font-size:28px;line-height:1.2}
    h2{margin:28px 0 10px;font-size:19px;color:#245343}
    h3{margin:0 0 8px;font-size:17px}
    .meta{margin:0;color:#64706a}
    ul,ol{margin:0;padding-left:22px}
    li{margin:6px 0}
    .group,.recipe{margin:10px 0;padding:14px;border:1px solid #f0ded1;border-radius:12px;background:#fff}
    .group strong,.material{font-weight:800}
    .material{margin:0 0 8px;color:#245343}
    .tips{margin-top:10px;color:#6f5848}
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(plan.title)}</h1>
    <p class="meta">${escapeHtml(plan.type)} · 约 ${plan.estimated_cost} 元 · ${plan.total_time} 分钟 · ${
      plan.dishes.length
    } 道菜</p>

    <h2>菜单</h2>
    ${renderList(
      plan.dishes.map((dish) => `${dish.name}${dish.reason ? ` - ${dish.reason}` : ""}`),
      true
    )}

    <h2>买菜清单</h2>
    ${plan.shopping_list
      .map(
        (group) =>
          `<div class="group"><strong>${escapeHtml(group.category)}</strong><p>${escapeHtml(
            formatItems(group.items)
          )}</p></div>`
      )
      .join("")}

    <h2>按点上桌</h2>
    ${renderList(schedule, true)}

    <h2>每道菜做法</h2>
    ${recipes}
  </main>
</body>
</html>`;
}
