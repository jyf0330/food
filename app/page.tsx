"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Choice<T extends string | number> = { id: T; label: string };
type StoredForm = {
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
type LastChoice = {
  title: string;
  resultUrl: string;
  form: StoredForm | null;
};

const LAST_FORM_KEY = "san-zhuo-cai:last-form";
const LAST_CHOICE_KEY = "san-zhuo-cai:last-choice";

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

const CHANNEL: Choice<string>[] = [
  { id: "菜市场", label: "菜市场" },
  { id: "楼下超市", label: "楼下超市" },
  { id: "朴朴", label: "朴朴" },
  { id: "沃尔玛", label: "沃尔玛" },
  { id: "盒马", label: "盒马" },
  { id: "美团买菜", label: "美团买菜" },
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

const normalizeForm = (value: unknown): StoredForm | null => {
  if (!value || typeof value !== "object") return null;
  const data = value as Partial<StoredForm>;
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
  };
};

const buildResultUrl = (form: StoredForm) => {
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
  });
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
  const [channel, setChannel] = useState(DEFAULT_FORM.channel);
  const [avoid, setAvoid] = useState<string[]>(DEFAULT_FORM.avoid);
  const [finishTime, setFinishTime] = useState(DEFAULT_FORM.finishTime);
  const [cookSpeed, setCookSpeed] = useState(DEFAULT_FORM.cookSpeed);
  const [lastForm, setLastForm] = useState<StoredForm | null>(null);
  const [lastChoice, setLastChoice] = useState<LastChoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedForm = normalizeForm(
        parseJson(window.localStorage.getItem(LAST_FORM_KEY))
      );
      const savedChoice = normalizeChoice(
        parseJson(window.localStorage.getItem(LAST_CHOICE_KEY))
      );
      setLastForm(savedForm);
      setLastChoice(savedChoice);
    } catch {
      setLastForm(null);
      setLastChoice(null);
    }
  }, []);

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const applyForm = (form: StoredForm) => {
    setPeople(form.people);
    setFamily(form.family);
    setBudget(form.budget);
    setTime(form.time);
    setTaste(form.taste);
    setChannel(form.channel);
    setAvoid(form.avoid);
    setFinishTime(form.finishTime);
    setCookSpeed(form.cookSpeed);
  };

  const currentForm = (): StoredForm => ({
    people,
    family,
    budget,
    time,
    taste,
    channel,
    avoid,
    finishTime,
    cookSpeed,
  });

  const saveLastForm = (form: StoredForm) => {
    try {
      window.localStorage.setItem(LAST_FORM_KEY, JSON.stringify(form));
    } catch {
      // Storage can be unavailable; navigation should still work.
    }
    setLastForm(form);
  };

  const goToResult = (form: StoredForm) => {
    setLoading(true);
    saveLastForm(form);
    router.push(buildResultUrl(form));
  };

  const onSubmit = () => {
    goToResult(currentForm());
  };

  return (
    <div className="container">
      <header className="header">
        <h1>今天吃什么</h1>
        <p>帮你想好买什么、做什么、怎么做</p>
      </header>

      {(lastChoice || lastForm) && (
        <section className="memory-section">
          {lastChoice && (
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
          )}

          {lastForm && (
            <div className="memory-card">
              <div className="memory-text">上次设置</div>
              <div className="memory-actions">
                <button
                  type="button"
                  className="memory-btn"
                  onClick={() => goToResult(lastForm)}
                  disabled={loading}
                >
                  直接用
                </button>
                <button
                  type="button"
                  className="memory-btn"
                  onClick={() => applyForm(lastForm)}
                >
                  修改
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="form-section">
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

      <section className="form-section">
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

      <section className="form-section">
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

      <section className="form-section">
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

      <section className="form-section">
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
      </section>

      <section className="form-section">
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
      </section>

      <section className="form-section">
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
      </section>

      <section className="form-section">
        <label className="form-label">买菜方式？</label>
        <div className="chip-group">
          {CHANNEL.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`chip ${channel === o.id ? "active" : ""}`}
              onClick={() => setChannel(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section className="form-section">
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
      </section>

      <button
        type="button"
        className="submit-btn"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? "正在为你搭一桌饭…" : "看看今天吃什么"}
      </button>
    </div>
  );
}
