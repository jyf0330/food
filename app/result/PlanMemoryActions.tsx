"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { rememberMealChoice, type MealMemoryForm } from "@/lib/mealMemory";

export type PlanMemoryForm = MealMemoryForm;

type PlanMemoryActionsProps = {
  planIndex: number;
  planTitle: string;
  planType: string;
  form: PlanMemoryForm;
  currentVariant: number;
};

export default function PlanMemoryActions({
  planIndex,
  planTitle,
  planType,
  form,
  currentVariant,
}: PlanMemoryActionsProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rememberPlan = () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    rememberMealChoice(localStorage, {
      planIndex,
      planTitle,
      planType,
      resultUrl: window.location.href,
      form,
    });

    setSaved(true);
    resetTimer.current = setTimeout(() => setSaved(false), 1400);
  };

  const swapTable = () => {
    const params = new URLSearchParams({
      people: String(form.people),
      family: form.family,
      budget: String(form.budget),
      time: String(form.time),
      taste: form.taste.join(","),
      channel: form.channel,
      avoid: form.avoid.join(","),
      finishTime: form.finishTime,
      cookSpeed: form.cookSpeed,
      favoriteFoods: form.favoriteFoods.join(","),
      selectedDishes: form.selectedDishes.join(","),
      variant: String(currentVariant + 1),
    });
    if (form.userId) {
      params.set("userId", form.userId);
    }
    router.push(`/result?${params.toString()}`);
  };

  return (
    <div className="plan-actions">
      <button
        type="button"
        className="plan-action-btn plan-action-primary"
        onClick={rememberPlan}
      >
        {saved ? "已记住" : "就用这桌"}
      </button>
      <button
        type="button"
        className="plan-action-btn plan-action-secondary"
        onClick={swapTable}
      >
        换一桌
      </button>
      <button
        type="button"
        className="plan-action-btn plan-action-secondary"
        onClick={() => router.push("/")}
      >
        改条件
      </button>
    </div>
  );
}
