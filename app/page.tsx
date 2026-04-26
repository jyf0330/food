"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { restoreHomeForm, type MealMemoryForm } from "@/lib/mealMemory";
import { nextResultVariant } from "@/lib/resultVariant";
import { buildPrefixedUserId, getUserIdDisplay } from "@/lib/userIdentity";

type Choice<T extends string | number> = { id: T; label: string };
type StoredForm = MealMemoryForm;
type LastChoice = {
  title: string;
  resultUrl: string;
  form: StoredForm | null;
};
type HomeDish = {
  name: string;
  category: string;
  time: number;
  note: string;
};

const LAST_FORM_KEY = "san-zhuo-cai:last-form";
const LAST_CHOICE_KEY = "san-zhuo-cai:last-choice";
const USER_ID_COOKIE = "jtcsm_user_id";

const HOME_DISHES: HomeDish[] = [
  { name: "番茄炒蛋", category: "蛋类", time: 12, note: "酸甜快手" },
  { name: "土豆焖鸡", category: "荤菜", time: 35, note: "下饭一锅出" },
  { name: "清蒸鲈鱼", category: "荤菜", time: 18, note: "清淡高蛋白" },
  { name: "蒜蓉菜心", category: "素菜", time: 8, note: "深圳家常" },
  { name: "肉末蒸蛋", category: "蛋类", time: 18, note: "嫩滑友好" },
  { name: "番茄牛肉", category: "荤菜", time: 18, note: "开胃不腻" },
  { name: "紫菜蛋花汤", category: "汤", time: 8, note: "最快热汤" },
  { name: "虾仁滑蛋", category: "蛋类", time: 12, note: "嫩滑鲜甜" },
  { name: "白灼芥兰", category: "素菜", time: 10, note: "清爽脆嫩" },
  { name: "丝瓜蛋花汤", category: "汤", time: 12, note: "清甜润口" },
  { name: "玉米胡萝卜排骨汤", category: "汤", time: 45, note: "汤水足" },
  { name: "家常豆腐", category: "豆腐", time: 15, note: "便宜下饭" },
];

const PEOPLE: Choice<number>[] = [
  { id: 1, label: "1人" },
  { id: 2, label: "2人" },
  { id: 3, label: "3人" },
  { id: 4, label: "4人" },
  { id: 5, label: "5人+" },
];

const FAMILY: Choice<string>[] = [
  { id: "none", label: "没有" },
  { id: "child", label: "有小孩" },
  { id: "elder", label: "有老人" },
  { id: "both", label: "都有" },
];

const BUDGET: Choice<number>[] = [
  { id: 50, label: "50以内" },
  { id: 80, label: "50-80" },
  { id: 120, label: "80-120" },
  { id: 200, label: "120+" },
];

const TIME: Choice<number>[] = [
  { id: 20, label: "20分钟" },
  { id: 30, label: "30分钟" },
  { id: 40, label: "40分钟" },
  { id: 60, label: "1小时" },
];

const TASTE: Choice<string>[] = [
  { id: "清淡", label: "清淡" },
  { id: "家常", label: "家常" },
  { id: "重口", label: "重口" },
  { id: "不辣", label: "不辣" },
  { id: "微辣", label: "微辣" },
];

const AVOID: Choice<string>[] = [
  { id: "辣", label: "辣" },
  { id: "鱼", label: "鱼" },
  { id: "牛羊肉", label: "牛羊肉" },
  { id: "海鲜", label: "海鲜" },
  { id: "香菜", label: "香菜" },
  { id: "内脏", label: "内脏" },
];

const FINISH_TIME: Choice<string>[] = [
  { id: "12:00", label: "12:00" },
  { id: "18:30", label: "18:30" },
  { id: "19:00", label: "19:00" },
  { id: "20:00", label: "20:00" },
];

const COOK_SPEED: Choice<string>[] = [
  { id: "normal", label: "正常" },
  { id: "slow", label: "慢一点" },
  { id: "beginner", label: "新手慢做" },
];

const DEFAULT_SELECTED_DISHES = ["番茄炒蛋", "蒜蓉菜心", "紫菜蛋花汤", "土豆焖鸡"];

const DEFAULT_FORM: StoredForm = {
  people: 3,
  family: "child",
  budget: 80,
  time: 40,
  taste: ["清淡", "不辣"],
  channel: "菜市场",
  avoid: [],
  finishTime: "19:00",
  cookSpeed: "normal",
  userId: "",
  favoriteFoods: [],
  selectedDishes: DEFAULT_SELECTED_DISHES,
};

const splitList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return value.split(",").filter(Boolean);
  }
  return [];
};

const normalizeFoodName = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_-]/g, "")
    .slice(0, 24);

const knownHomeDishes = new Set(HOME_DISHES.map((dish) => dish.name));

const normalizeSelectedDishes = (value: unknown) => {
  const selected = Array.from(
    new Set(splitList(value).map(normalizeFoodName).filter((name) => knownHomeDishes.has(name)))
  ).slice(0, 12);
  return selected.length ? selected : DEFAULT_SELECTED_DISHES;
};

const normalizeFavoriteFoods = (value: unknown) =>
  Array.from(new Set(splitList(value).map(normalizeFoodName).filter(Boolean))).slice(0, 12);

const pickNumber = (value: unknown, fallback: number) => {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
};

const pickString = (value: unknown, fallback: string) =>
  typeof value === "string" && value ? value : fallback;

const parseJson = (value: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? ""
  );
};

const saveUserIdCookie = (userId: string) => {
  const prefixed = buildPrefixedUserId(userId);
  if (!prefixed) return;
  document.cookie = `${USER_ID_COOKIE}=${encodeURIComponent(
    prefixed
  )}; max-age=31536000; path=/; SameSite=Lax`;
};

const normalizeForm = (value: unknown): StoredForm | null => {
  if (!value || typeof value !== "object") return null;
  const data = value as Partial<StoredForm> & { user_id?: unknown };
  return {
    people: pickNumber(data.people, DEFAULT_FORM.people),
    family: pickString(data.family, DEFAULT_FORM.family),
    budget: pickNumber(data.budget, DEFAULT_FORM.budget),
    time: pickNumber(data.time, DEFAULT_FORM.time),
    taste: splitList(data.taste),
    channel: pickString(data.channel, DEFAULT_FORM.channel),
    avoid: splitList(data.avoid),
    finishTime: pickString(data.finishTime, DEFAULT_FORM.finishTime),
    cookSpeed: pickString(data.cookSpeed, DEFAULT_FORM.cookSpeed),
    userId: getUserIdDisplay(data.userId ?? data.user_id),
    favoriteFoods: normalizeFavoriteFoods(data.favoriteFoods),
    selectedDishes: normalizeSelectedDishes(data.selectedDishes),
  };
};

const buildResultUrl = (form: StoredForm, variant?: number) => {
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
  });
  const userId = getUserIdDisplay(form.userId);
  if (userId) {
    params.set("userId", userId);
  }
  if (variant) {
    params.set("variant", String(variant));
  }
  return `/result?${params.toString()}`;
};

const normalizeResultUrl = (value: unknown) => {
  if (typeof value !== "string" || !value) return "";
  if (value === "/result" || value.startsWith("/result?")) return value;
  if (typeof window === "undefined") return "";
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin && url.pathname === "/result"
      ? `${url.pathname}${url.search}`
      : "";
  } catch {
    return "";
  }
};

const normalizeChoice = (value: unknown): LastChoice | null => {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const form = normalizeForm(
    data.form ?? data.lastForm ?? data.input ?? data.conditions ?? data.params
  );
  const resultUrl =
    normalizeResultUrl(data.resultUrl ?? data.resultURL ?? data.url ?? data.href) ||
    (form ? buildResultUrl(form) : "");
  if (!resultUrl) return null;

  const title =
    pickString(data.title, "") ||
    pickString(data.planTitle, "") ||
    pickString(data.choiceTitle, "") ||
    pickString(data.name, "") ||
    pickString(data.planName, "") ||
    pickString(data.selectedTitle, "") ||
    pickString(data.label, "") ||
    pickString(data.choice, "") ||
    "这桌菜";

  return { title, resultUrl, form };
};

export default function HomePage() {
  const router = useRouter();
  const [people, setPeople] = useState(DEFAULT_FORM.people);
  const [family, setFamily] = useState(DEFAULT_FORM.family);
  const [budget, setBudget] = useState(DEFAULT_FORM.budget);
  const [time, setTime] = useState(DEFAULT_FORM.time);
  const [taste, setTaste] = useState<string[]>(DEFAULT_FORM.taste);
  const [avoid, setAvoid] = useState<string[]>(DEFAULT_FORM.avoid);
  const [finishTime, setFinishTime] = useState(DEFAULT_FORM.finishTime);
  const [cookSpeed, setCookSpeed] = useState(DEFAULT_FORM.cookSpeed);
  const [userId, setUserId] = useState(DEFAULT_FORM.userId);
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>(DEFAULT_FORM.favoriteFoods);
  const [favoriteFoodInput, setFavoriteFoodInput] = useState("");
  const [selectedDishes, setSelectedDishes] = useState<string[]>(DEFAULT_FORM.selectedDishes);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [lastChoice, setLastChoice] = useState<LastChoice | null>(null);
  const [loading, setLoading] = useState(false);

  const applyForm = (form: StoredForm) => {
    setPeople(form.people);
    setFamily(form.family);
    setBudget(form.budget);
    setTime(form.time);
    setTaste(form.taste);
    setAvoid(form.avoid);
    setFinishTime(form.finishTime);
    setCookSpeed(form.cookSpeed);
    setUserId(form.userId);
    setFavoriteFoods(form.favoriteFoods);
    setSelectedDishes(normalizeSelectedDishes(form.selectedDishes));
    setAdvancedOpen(form.favoriteFoods.length > 0);
  };

  useEffect(() => {
    try {
      const savedForm = normalizeForm(
        parseJson(window.localStorage.getItem(LAST_FORM_KEY))
      );
      const savedChoice = normalizeChoice(
        parseJson(window.localStorage.getItem(LAST_CHOICE_KEY))
      );
      const cookieUserId = getUserIdDisplay(
        decodeURIComponent(readCookie(USER_ID_COOKIE))
      );
      const restoredForm = restoreHomeForm(savedForm, savedChoice?.form ?? null, cookieUserId);
      if (restoredForm) {
        applyForm(restoredForm);
      } else if (cookieUserId) {
        setUserId(cookieUserId);
      }
      setLastChoice(savedChoice);
    } catch {
      setLastChoice(null);
    }
  }, []);

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const toggleDish = (dishName: string) => {
    setSelectedDishes((current) =>
      current.includes(dishName)
        ? current.filter((name) => name !== dishName)
        : [...current, dishName].slice(0, 12)
    );
  };

  const currentForm = (): StoredForm => ({
    people,
    family,
    budget,
    time,
    taste,
    channel: DEFAULT_FORM.channel,
    avoid,
    finishTime,
    cookSpeed,
    userId: getUserIdDisplay(userId),
    favoriteFoods,
    selectedDishes,
  });

  const addFavoriteFood = () => {
    const food = normalizeFoodName(favoriteFoodInput);
    if (!food) return;
    setFavoriteFoods((current) => {
      if (current.includes(food)) return current;
      return [...current, food].slice(0, 12);
    });
    setFavoriteFoodInput("");
  };

  const removeFavoriteFood = (food: string) => {
    setFavoriteFoods((current) => current.filter((item) => item !== food));
  };

  const saveLastForm = (form: StoredForm) => {
    try {
      saveUserIdCookie(form.userId);
      window.localStorage.setItem(LAST_FORM_KEY, JSON.stringify(form));
    } catch {
      // Storage can be unavailable; navigation should still work.
    }
  };

  const goToResult = (form: StoredForm) => {
    if (form.selectedDishes.length === 0) return;
    setLoading(true);
    saveLastForm(form);
    router.push(buildResultUrl(form, nextResultVariant()));
  };

  const onSubmit = () => {
    goToResult(currentForm());
  };

  return (
    <main className="home-shell">
      <section className="home-hero">
        <div>
          <p className="home-kicker">今天吃什么</p>
          <h1>先选菜，再生成一份能直接照着做的菜谱。</h1>
          <p>
            12 道家常菜都可以点选，系统会整理成菜单、买菜清单、做饭顺序和每道菜做法。
          </p>
        </div>
        <div className="home-hero-panel" aria-label="当前选菜统计">
          <strong>{selectedDishes.length}</strong>
          <span>道已选</span>
        </div>
      </section>

      {lastChoice && (
        <section className="memory-section home-memory">
          <div className="memory-card">
            <div className="memory-text">上次选了：{lastChoice.title}</div>
            <div className="memory-actions">
              <a
                className="memory-link"
                href={lastChoice.resultUrl}
                onClick={() => {
                  if (lastChoice.form) saveLastForm(lastChoice.form);
                }}
              >
                直接用这桌
              </a>
              {lastChoice.form && (
                <button
                  type="button"
                  className="memory-btn"
                  onClick={() => applyForm(lastChoice.form as StoredForm)}
                >
                  修改条件
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="dish-picker-section" aria-labelledby="dish-picker-title">
        <div className="home-section-heading">
          <h2 id="dish-picker-title">选今天想吃的菜</h2>
          <button
            type="button"
            className="home-link-btn"
            onClick={() => setSelectedDishes(DEFAULT_SELECTED_DISHES)}
          >
            恢复推荐组合
          </button>
        </div>

        <div className="dish-grid">
          {HOME_DISHES.map((dish) => {
            const active = selectedDishes.includes(dish.name);
            return (
              <button
                key={dish.name}
                type="button"
                className={`dish-choice${active ? " active" : ""}`}
                aria-pressed={active}
                onClick={() => toggleDish(dish.name)}
              >
                <span className="dish-choice-top">
                  <span className="dish-choice-name">{dish.name}</span>
                  <span className="dish-choice-mark">{active ? "已选" : "可选"}</span>
                </span>
                <span className="dish-choice-meta">
                  {dish.category} · {dish.time} 分钟
                </span>
                <span className="dish-choice-note">{dish.note}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="preference-panel">
        <div className="home-section-heading">
          <h2>吃饭条件</h2>
          <span>{people} 人 · 约 {budget} 元 · {time} 分钟</span>
        </div>

        <div className="form-section compact-form-section">
          <label className="form-label" htmlFor="user-id">
            你的代号（可中文）
          </label>
          <input
            id="user-id"
            className="text-input"
            value={userId}
            onChange={(event) => setUserId(getUserIdDisplay(event.target.value))}
            placeholder="例如 小王 / 龙岗妈妈"
            maxLength={32}
          />
        </div>

        <div className="home-option-grid">
          <section className="form-section compact-form-section">
            <label className="form-label">今晚几个人吃饭？</label>
            <div className="chip-group">
              {PEOPLE.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`chip ${people === o.id ? "active" : ""}`}
                  onClick={() => setPeople(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          <section className="form-section compact-form-section">
            <label className="form-label">有没有小孩/老人？</label>
            <div className="chip-group">
              {FAMILY.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`chip ${family === o.id ? "active" : ""}`}
                  onClick={() => setFamily(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          <section className="form-section compact-form-section">
            <label className="form-label">预算？</label>
            <div className="chip-group">
              {BUDGET.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`chip ${budget === o.id ? "active" : ""}`}
                  onClick={() => setBudget(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          <section className="form-section compact-form-section">
            <label className="form-label">想做多久？</label>
            <div className="chip-group">
              {TIME.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`chip ${time === o.id ? "active" : ""}`}
                  onClick={() => setTime(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="form-section advanced-section">
          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setAdvancedOpen((open) => !open)}
            aria-expanded={advancedOpen}
          >
            <span>口味、忌口和高级功能</span>
            <span>{advancedOpen ? "收起" : "展开"}</span>
          </button>

          {advancedOpen && (
            <div className="advanced-panel">
              <div className="home-option-grid">
                <div>
                  <label className="form-label">几点前做好？</label>
                  <div className="chip-group">
                    {FINISH_TIME.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`chip ${finishTime === o.id ? "active" : ""}`}
                        onClick={() => setFinishTime(o.id)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">做饭速度？</label>
                  <div className="chip-group">
                    {COOK_SPEED.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`chip ${cookSpeed === o.id ? "active" : ""}`}
                        onClick={() => setCookSpeed(o.id)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">口味？（可多选）</label>
                  <div className="chip-group">
                    {TASTE.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`chip ${taste.includes(o.id) ? "active" : ""}`}
                        onClick={() => setTaste(toggle(taste, o.id))}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">不吃什么？（可多选）</label>
                  <div className="chip-group">
                    {AVOID.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`chip ${avoid.includes(o.id) ? "active" : ""}`}
                        onClick={() => setAvoid(toggle(avoid, o.id))}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="favorite-food-panel">
                <label className="form-label" htmlFor="favorite-food">
                  喜欢的食物
                </label>
                <div className="favorite-input-row">
                  <input
                    id="favorite-food"
                    className="text-input"
                    value={favoriteFoodInput}
                    onChange={(event) => setFavoriteFoodInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addFavoriteFood();
                      }
                    }}
                    placeholder="例如 豆腐 / 番茄炒蛋"
                    maxLength={24}
                  />
                  <button type="button" className="memory-btn" onClick={addFavoriteFood}>
                    添加
                  </button>
                </div>
                {favoriteFoods.length ? (
                  <div className="chip-group favorite-list" aria-label="已设置喜欢的食物">
                    {favoriteFoods.map((food) => (
                      <button
                        key={food}
                        type="button"
                        className="chip active"
                        onClick={() => removeFavoriteFood(food)}
                        title="点击移除"
                      >
                        {food} ×
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="advanced-hint">设置后，每天有 50% 概率把其中一个放进推荐菜单。</p>
                )}
              </div>
            </div>
          )}
        </section>
      </section>

      <div className="home-submit-bar">
        <button
          type="button"
          className="submit-btn"
          onClick={onSubmit}
          disabled={loading || selectedDishes.length === 0}
        >
          {loading
            ? "正在生成菜谱…"
            : selectedDishes.length
              ? `生成 ${selectedDishes.length} 道菜的菜谱`
              : "先选一道菜"}
        </button>
      </div>
    </main>
  );
}
