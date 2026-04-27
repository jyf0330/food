"use client";

import type { MealPlan } from "@/lib/types";
import { formatMealPlanCopyText } from "@/lib/mealPlanText";
import type { PlanMemoryForm } from "./PlanMemoryActions";
import { useState } from "react";

type ScheduleNode = string | { time: string; task: string };
type PlanWithOptionalSchedule = Omit<MealPlan, "cooking_schedule"> & {
  cooking_schedule?: ScheduleNode[];
};

type PlanSwitcherProps = {
  plans: MealPlan[];
  form: PlanMemoryForm;
  currentVariant: number;
  initialSelectedIndex: number;
};

export default function PlanSwitcher({
  plans,
  initialSelectedIndex,
}: PlanSwitcherProps) {
  const [copied, setCopied] = useState(false);
  const plan = plans[initialSelectedIndex] as PlanWithOptionalSchedule | undefined;

  if (!plan) {
    return null;
  }

  const copyWithFallback = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const copyPlan = async () => {
    const text = formatMealPlanCopyText(plan as MealPlan);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyWithFallback(text);
      }
    } catch {
      copyWithFallback(text);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <>
      <article className="plan-card">
        <button type="button" className="copy-recipe-btn" onClick={copyPlan}>
          {copied ? "已复制菜谱文字" : "一键复制菜谱文字"}
        </button>

        <div className="section-title">🍲 菜单</div>
        <ul className="dish-list">
          {plan.dishes.map((d, j) => (
            <li key={j}>
              <div className="dish-name">{d.name}</div>
              <div className="dish-reason">{d.reason}</div>
            </li>
          ))}
        </ul>

        <div className="section-title">🛒 买菜清单</div>
        {plan.shopping_list.map((g, j) => (
          <div key={j} className="shopping-group">
            <div className="shopping-group-name">{g.category}</div>
            <div className="shopping-items">
              {g.items.map((it, k) => (
                <span key={k}>
                  {it.name} · {it.amount}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="section-title">👩‍🍳 做饭顺序</div>
        <ol className="cooking-order">
          {plan.cooking_order.map((step, j) => (
            <li key={j}>{step}</li>
          ))}
        </ol>

        {plan.cooking_schedule?.length ? (
          <>
            <div className="section-title">按点上桌计划</div>
            <ol className="cooking-schedule">
              {plan.cooking_schedule.map((node, j) => (
                <li key={j}>
                  {typeof node === "string" ? (
                    node
                  ) : (
                    <>
                      {node.time ? <strong>{node.time}</strong> : null}
                      {node.time && node.task ? " · " : null}
                      {node.task}
                    </>
                  )}
                </li>
              ))}
            </ol>
          </>
        ) : null}

        <div className="section-title">📖 每道菜做法</div>
        <div className="recipe-list">
          {plan.dishes.map((dish, j) => (
            <section key={j} className="recipe-item">
              <div className="recipe-name">{dish.name}</div>
              <ol className="recipe-steps">
                {(dish.steps || []).map((step, k) => (
                  <li key={k}>{step}</li>
                ))}
              </ol>
              {dish.tips?.length ? (
                <div className="recipe-tips">
                  {dish.tips.map((tip, k) => (
                    <span key={k}>{tip}</span>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
