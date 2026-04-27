"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  readDishEngagement,
  toggleDishEngagement,
  type DishEngagement,
} from "@/lib/dishEngagement";
import {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_POOL,
  homeDishesFromNames,
  refreshUnselectedHomeDishes,
} from "@/lib/homeDishes";
import { nextResultVariant } from "@/lib/resultVariant";

const SELECTED_DISHES_KEY = "san-zhuo-cai:home-selected-dishes";
const VISIBLE_DISHES_KEY = "san-zhuo-cai:home-visible-dishes";
const HOME_USER_ID_KEY = "san-zhuo-cai:home-user-id";
const HOME_DISH_COUNT = 12;

const knownHomeDishes = new Set(HOME_DISH_POOL.map((dish) => dish.name));

const normalizeDishNames = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;

  const names = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((name) => knownHomeDishes.has(name))
    )
  ).slice(0, HOME_DISH_COUNT);

  return names.length ? names : fallback;
};

const readJsonList = (key: string, fallback: string[]) => {
  try {
    return normalizeDishNames(JSON.parse(localStorage.getItem(key) ?? "null"), fallback);
  } catch {
    return fallback;
  }
};

const writeJsonList = (key: string, value: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable; current-session state still works.
  }
};

const buildResultUrl = (selectedDishes: string[]) => {
  const params = new URLSearchParams({
    selectedDishes: selectedDishes.join(","),
    variant: String(nextResultVariant()),
  });
  return `/result?${params.toString()}`;
};

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};

const getHomeUserId = () => {
  try {
    const existing = localStorage.getItem(HOME_USER_ID_KEY);
    if (existing) return existing;
    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(HOME_USER_ID_KEY, next);
    return next;
  } catch {
    return "anonymous";
  }
};

export default function HomePage() {
  const router = useRouter();
  const [visibleDishNames, setVisibleDishNames] = useState<string[]>(DEFAULT_HOME_DISH_NAMES);
  const [selectedDishes, setSelectedDishes] = useState<string[]>(DEFAULT_HOME_DISH_NAMES.slice(0, 4));
  const [engagement, setEngagement] = useState<DishEngagement>({ liked: [], saved: [] });
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedToday, setLikedToday] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "saved">("all");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const visibleDishes = useMemo(() => homeDishesFromNames(visibleDishNames), [visibleDishNames]);
  const filteredDishes = useMemo(
    () =>
      filter === "saved"
        ? visibleDishes.filter((dish) => engagement.saved.includes(dish.name))
        : visibleDishes,
    [engagement.saved, filter, visibleDishes]
  );
  const selectedSummary = selectedDishes.slice(0, 2).join("、");
  const selectedMoreCount = Math.max(0, selectedDishes.length - 2);

  useEffect(() => {
    const nextVisible = readJsonList(VISIBLE_DISHES_KEY, DEFAULT_HOME_DISH_NAMES);
    setVisibleDishNames(nextVisible);
    setSelectedDishes(readJsonList(SELECTED_DISHES_KEY, DEFAULT_HOME_DISH_NAMES.slice(0, 4)));
    setUserId(getHomeUserId());
    try {
      setEngagement(readDishEngagement(localStorage));
    } catch {
      setEngagement({ liked: [], saved: [] });
    }
  }, []);

  useEffect(() => {
    if (!userId || visibleDishNames.length === 0) return;
    const params = new URLSearchParams({
      dishes: visibleDishNames.join(","),
      userId,
      date: todayKey(),
    });

    fetch(`/api/dish-likes?${params.toString()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { counts?: Record<string, number>; liked?: string[] } | null) => {
        if (!data) return;
        setLikeCounts(data.counts ?? {});
        setLikedToday(Array.isArray(data.liked) ? data.liked : []);
      })
      .catch(() => {
        // Like counts are social proof; menu selection should still work without them.
      });
  }, [userId, visibleDishNames]);

  const setAndPersistSelectedDishes = (next: string[]) => {
    setSelectedDishes(next);
    writeJsonList(SELECTED_DISHES_KEY, next);
  };

  const setAndPersistVisibleDishes = (next: string[]) => {
    setVisibleDishNames(next);
    writeJsonList(VISIBLE_DISHES_KEY, next);
  };

  const toggleDish = (dishName: string) => {
    setAndPersistSelectedDishes(
      selectedDishes.includes(dishName)
        ? selectedDishes.filter((name) => name !== dishName)
        : [...selectedDishes, dishName].slice(0, HOME_DISH_COUNT)
    );
  };

  const refreshDishes = () => {
    setAndPersistVisibleDishes(
      refreshUnselectedHomeDishes(visibleDishNames, selectedDishes, Date.now())
    );
  };

  const toggleSaved = (dishName: string) => {
    try {
      setEngagement(toggleDishEngagement(localStorage, "saved", dishName));
    } catch {
      setEngagement((current) => {
        const exists = current.saved.includes(dishName);
        return {
          ...current,
          saved: exists
            ? current.saved.filter((name) => name !== dishName)
            : [...current.saved, dishName],
        };
      });
    }
  };

  const likeDish = async (dishName: string) => {
    if (!userId || likedToday.includes(dishName)) return;

    try {
      const response = await fetch("/api/dish-likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dishName, userId, date: todayKey() }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { accepted?: boolean; count?: number };
      if (typeof data.count === "number") {
        setLikeCounts((current) => ({ ...current, [dishName]: data.count! }));
      }
      if (data.accepted) {
        setLikedToday((current) => [...current, dishName]);
      }
    } catch {
      // Ignore transient network errors; the user can try again.
    }
  };

  const generateRecipe = () => {
    if (selectedDishes.length === 0) return;
    setLoading(true);
    router.push(buildResultUrl(selectedDishes));
  };

  return (
    <main className="home-shell">
      <header className="home-topbar">
        <p className="home-kicker">今天吃什么</p>
        <h1>点几道想吃的菜</h1>
        <p>选中要做的，没选中的可以刷新；每天每道菜能点一次赞。</p>
      </header>

      <section className="home-toolbar" aria-label="菜品操作">
        <div className="home-filter">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            全部
          </button>
          <button
            type="button"
            className={filter === "saved" ? "active" : ""}
            onClick={() => setFilter("saved")}
          >
            收藏
          </button>
        </div>
        <button type="button" className="home-link-btn" onClick={refreshDishes}>
          刷新
        </button>
      </section>

      <section className="dish-picker-section" aria-label="选择今天想吃的菜">
        {filteredDishes.length ? (
          <div className="dish-list-home">
            {filteredDishes.map((dish) => {
              const selected = selectedDishes.includes(dish.name);
              const saved = engagement.saved.includes(dish.name);
              const liked = likedToday.includes(dish.name);
              const count = likeCounts[dish.name] ?? 0;

              return (
                <article key={dish.name} className={`dish-row${selected ? " selected" : ""}`}>
                  <button
                    type="button"
                    className="dish-main"
                    aria-pressed={selected}
                    onClick={() => toggleDish(dish.name)}
                  >
                    <span className="dish-status">{selected ? "已选" : "可选"}</span>
                    <span className="dish-name">{dish.name}</span>
                    <span className="dish-meta">
                      {dish.category} · {dish.time} 分钟 · {dish.note}
                    </span>
                  </button>

                  <div className="dish-actions">
                    <button
                      type="button"
                      className={liked ? "active" : ""}
                      aria-pressed={liked}
                      aria-label={`${dish.name} 今日点赞 ${count} 次`}
                      disabled={liked}
                      onClick={() => likeDish(dish.name)}
                    >
                      赞 {count}
                    </button>
                    <button
                      type="button"
                      className={saved ? "active" : ""}
                      aria-pressed={saved}
                      aria-label={`${saved ? "取消收藏" : "收藏"}${dish.name}`}
                      onClick={() => toggleSaved(dish.name)}
                    >
                      收藏
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-saved">
            <strong>还没有收藏</strong>
            <p>看到常吃的菜，点一下收藏，下次会在这里出现。</p>
            <button type="button" onClick={() => setFilter("all")}>
              去全部看看
            </button>
          </div>
        )}
      </section>

      <div className="home-submit-bar">
        <div className="home-submit-copy">
          <strong>{selectedDishes.length ? `已选 ${selectedDishes.length} 道` : "先选一道菜"}</strong>
          <span>
            {selectedDishes.length
              ? `${selectedSummary}${selectedMoreCount ? ` 等 ${selectedDishes.length} 道` : ""}`
              : "点菜名就能加入菜单"}
          </span>
        </div>
        <button
          type="button"
          className="submit-btn"
          onClick={generateRecipe}
          disabled={loading || selectedDishes.length === 0}
        >
          {loading ? "生成中…" : "生成菜谱"}
        </button>
      </div>
    </main>
  );
}
