import Link from "next/link";
import { buildGenerateResponse } from "@/lib/mealPlanGenerator";
import { recommendedInitialPlanIndex } from "@/lib/planSelection";
import type { GenerateRequest } from "@/lib/types";
import { buildPrefixedUserId, getUserIdDisplay } from "@/lib/userIdentity";
import type { PlanMemoryForm } from "./PlanMemoryActions";
import PlanSwitcher from "./PlanSwitcher";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
const readString = (sp: SP, key: string) =>
  typeof sp[key] === "string" ? (sp[key] as string) : "";

const readNumber = (sp: SP, key: string, fallback: number) => {
  const value = Number(readString(sp, key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const readNonNegativeNumber = (sp: SP, key: string, fallback: number) => {
  const value = Number(readString(sp, key));
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

const readList = (sp: SP, key: string) =>
  readString(sp, key)
    ? readString(sp, key)
        .split(",")
        .filter(Boolean)
    : [];

function parseForm(sp: SP): PlanMemoryForm {
  return {
    people: readNumber(sp, "people", 3),
    family: readString(sp, "family") || "none",
    budget: readNumber(sp, "budget", 80),
    time: readNumber(sp, "time", 40),
    taste: readList(sp, "taste"),
    channel: readString(sp, "channel") || "菜市场",
    avoid: readList(sp, "avoid"),
    finishTime: readString(sp, "finishTime"),
    cookSpeed: readString(sp, "cookSpeed"),
    userId: getUserIdDisplay(readString(sp, "userId")),
    favoriteFoods: readList(sp, "favoriteFoods"),
  };
}

function parseRequest(sp: SP): GenerateRequest {
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");

  const family = s("family") || "none";
  const finishTime = s("finishTime");
  const cookSpeed = s("cookSpeed");

  return {
    city: "深圳",
    people_count: readNumber(sp, "people", 3),
    has_child: family === "child" || family === "both",
    has_elder: family === "elder" || family === "both",
    budget: readNumber(sp, "budget", 80),
    time_limit: readNumber(sp, "time", 40),
    taste: readList(sp, "taste"),
    avoid: readList(sp, "avoid"),
    favorite_foods: readList(sp, "favoriteFoods"),
    shopping_channel: s("channel") || "菜市场",
    meal_type: "晚餐",
    kitchen_tools: ["炒锅", "电饭锅"],
    variant: readNonNegativeNumber(sp, "variant", 0),
    user_id: buildPrefixedUserId(s("userId")),
    ...(finishTime ? { finish_time: finishTime } : {}),
    ...(cookSpeed
      ? { cook_speed: cookSpeed as GenerateRequest["cook_speed"] }
      : {}),
  };
}

export default function ResultPage({ searchParams }: { searchParams: SP }) {
  const req = parseRequest(searchParams);
  const form = parseForm(searchParams);
  const currentVariant = readNonNegativeNumber(searchParams, "variant", 0);
  const response = buildGenerateResponse(req);

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← 重新填写
      </Link>

      <header className="header result-header">
        <h1>今天吃什么</h1>
        <p>
          {req.people_count} 人 · {req.shopping_channel} · 预算 约 {req.budget}{" "}
          元 · {req.time_limit} 分钟
        </p>
      </header>

      <section className="form-section result-summary">
        <strong>今日推荐买：</strong>
        <p className="summary-good">{response.daily_recommended.join("、")}</p>
        <strong>今天不太推荐：</strong>
        <p className="summary-muted">
          {response.daily_not_recommended
            .map((item) => `${item.name}（${item.reason}）`)
            .join(" · ")}
        </p>
      </section>

      <PlanSwitcher
        plans={response.plans}
        form={form}
        currentVariant={currentVariant}
        initialSelectedIndex={recommendedInitialPlanIndex(response.plans, req.budget)}
      />

      <p className="mock-note">
        当前为 mock 演示数据。接入 DeepSeek API 后将根据家庭情况动态生成。
      </p>
    </div>
  );
}
