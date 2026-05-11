"use client";

import type { MealPlan } from "@/lib/types";
import { formatMealPlanCopyHtml, formatMealPlanCopyText } from "@/lib/mealPlanText";
import { appendResultPlanIndex } from "@/lib/resultUrl";
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
  const [copiedAction, setCopiedAction] = useState<"text" | "html" | "link" | null>(null);
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

  const markCopied = (action: "text" | "html" | "link") => {
    setCopiedAction(action);
    window.setTimeout(() => setCopiedAction(null), 1400);
  };

  const writeTextToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyWithFallback(text);
      }
    } catch {
      copyWithFallback(text);
    }
  };

  const copyPlanText = async () => {
    await writeTextToClipboard(formatMealPlanCopyText(plan as MealPlan));
    markCopied("text");
  };

  const copyPlanHtml = async () => {
    const html = formatMealPlanCopyHtml(plan as MealPlan);
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([html], { type: "text/plain" }),
          }),
        ]);
      } else {
        await writeTextToClipboard(html);
      }
    } catch {
      await writeTextToClipboard(html);
    }
    markCopied("html");
  };

  const copyShareLink = async () => {
    await writeTextToClipboard(appendResultPlanIndex(window.location.href, initialSelectedIndex));
    markCopied("link");
  };

  return (
    <>
      <article className="plan-card">
        <div className="recipe-copy-actions" aria-label="菜谱导出">
          <button type="button" className="copy-recipe-btn" onClick={copyPlanText}>
            {copiedAction === "text" ? "已复制文字" : "复制文字"}
          </button>
          <button type="button" className="copy-recipe-btn secondary" onClick={copyPlanHtml}>
            {copiedAction === "html" ? "已复制 HTML" : "复制 HTML"}
          </button>
          <button type="button" className="copy-recipe-btn secondary" onClick={copyShareLink}>
            {copiedAction === "link" ? "已复制链接" : "复制分享链接"}
          </button>
        </div>

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
