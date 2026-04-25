import Link from "next/link";
import { buildGenerateResponse } from "@/lib/mealPlanGenerator";
import type { GenerateRequest } from "@/lib/types";
import { buildPrefixedUserId, getUserIdDisplay } from "@/lib/userIdentity";
import PlanMemoryActions, { type PlanMemoryForm } from "./PlanMemoryActions";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
type ScheduleNode = string | { time: string; task: string };
type MealPlanWithOptionalSchedule = ReturnType<typeof buildGenerateResponse>["plans"][number] & {
  cooking_schedule?: ScheduleNode[];
};

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
  const plans = response.plans as MealPlanWithOptionalSchedule[];

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

      {plans.map((plan, i) => (
        <article key={i} className="plan-card">
          <h2>
            {String.fromCharCode(65 + i)}. {plan.type}
          </h2>
          <div className="plan-meta">
            <span>💰 约 {plan.estimated_cost} 元</span>
            <span>⏱ 约 {plan.total_time} 分钟</span>
            <span>🍽 {plan.dishes.length} 道菜</span>
          </div>

          <p className="plan-reason">{plan.reason}</p>

          <PlanMemoryActions
            planIndex={i}
            planTitle={plan.title}
            planType={plan.type}
            form={form}
            currentVariant={currentVariant}
          />

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
      ))}

      <p className="mock-note">
        当前为 mock 演示数据。接入 DeepSeek API 后将根据家庭情况动态生成。
      </p>
    </div>
  );
}
