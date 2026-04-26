"use client";

import type { MealPlan } from "@/lib/types";
import { rememberMealChoice } from "@/lib/mealMemory";
import { formatMealPlanCopyText } from "@/lib/mealPlanText";
import PlanMemoryActions, { type PlanMemoryForm } from "./PlanMemoryActions";
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

const planLabel = (index: number) => String.fromCharCode(65 + index);

export default function PlanSwitcher({
  plans,
  form,
  currentVariant,
  initialSelectedIndex,
}: PlanSwitcherProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [copied, setCopied] = useState(false);
  const plan = plans[selectedIndex] as PlanWithOptionalSchedule | undefined;
  const selectedHomePlan = form.selectedDishes.length > 0 && selectedIndex === 0;

  const selectPlan = (index: number, selectedPlan: MealPlan) => {
    setSelectedIndex(index);
    try {
      rememberMealChoice(window.localStorage, {
        planIndex: index,
        planTitle: selectedPlan.title,
        planType: selectedPlan.type,
        resultUrl: window.location.href,
        form,
      });
    } catch {
      // Local storage can be unavailable; selecting a plan should still work.
    }
  };

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
      <section className="plan-switcher" aria-label="选择今天吃哪一桌">
        {plans.map((item, i) => {
          const active = i === selectedIndex;
          return (
            <button
              key={`${item.type}-${i}`}
              type="button"
              className={`plan-tab${active ? " active" : ""}`}
              aria-pressed={active}
              onClick={() => selectPlan(i, item)}
            >
              <span className="plan-tab-letter">{planLabel(i)}</span>
              <span className="plan-tab-copy">
                <span className="plan-tab-title">
                  {form.selectedDishes.length > 0 && i === 0 ? "自选菜谱" : item.type}
                </span>
                <span className="plan-tab-meta">
                  约 {item.estimated_cost} 元 · {item.total_time} 分钟
                </span>
              </span>
            </button>
          );
        })}
      </section>

      <article className="plan-card">
        <h2>
          {planLabel(selectedIndex)}. {selectedHomePlan ? "自选菜谱" : plan.type}
        </h2>
        <div className="plan-meta">
          <span>💰 约 {plan.estimated_cost} 元</span>
          <span>⏱ 约 {plan.total_time} 分钟</span>
          <span>🍽 {plan.dishes.length} 道菜</span>
        </div>

        <p className="plan-reason">{plan.reason}</p>

        <PlanMemoryActions
          planIndex={selectedIndex}
          planTitle={plan.title}
          planType={plan.type}
          form={form}
          currentVariant={currentVariant}
        />

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
