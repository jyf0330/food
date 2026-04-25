"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type PlanMemoryForm = {
  people: number;
  family: string;
  budget: number;
  time: number;
  taste: string[];
  channel: string;
  avoid: string[];
  finishTime: string;
  cookSpeed: string;
};

type PlanMemoryActionsProps = {
  planIndex: number;
  planTitle: string;
  planType: string;
  form: PlanMemoryForm;
};

const STORAGE_KEY = "san-zhuo-cai:last-choice";

export default function PlanMemoryActions({
  planIndex,
  planTitle,
  planType,
  form,
}: PlanMemoryActionsProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rememberPlan = () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        planIndex,
        planTitle,
        planType,
        resultUrl: window.location.href,
        form,
        savedAt: new Date().toISOString(),
      })
    );

    setSaved(true);
    resetTimer.current = setTimeout(() => setSaved(false), 1400);
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
        onClick={() => router.push("/")}
      >
        改条件
      </button>
    </div>
  );
}
