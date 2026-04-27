"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  readDishEngagement,
  toggleDishEngagement,
  type DishEngagement,
} from "@/lib/dishEngagement";
import { nextResultVariant } from "@/lib/resultVariant";

type HomeDish = {
  name: string;
  category: string;
  time: number;
  note: string;
};

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

const DEFAULT_SELECTED_DISHES = ["番茄炒蛋", "蒜蓉菜心", "紫菜蛋花汤", "土豆焖鸡"];
const SELECTED_DISHES_KEY = "san-zhuo-cai:home-selected-dishes";

const knownHomeDishes = new Set(HOME_DISHES.map((dish) => dish.name));

const normalizeSelectedDishes = (value: unknown) => {
  if (!Array.isArray(value)) return DEFAULT_SELECTED_DISHES;

  const selected = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((name) => knownHomeDishes.has(name))
    )
  ).slice(0, 12);

  return selected.length ? selected : DEFAULT_SELECTED_DISHES;
};

const readSelectedDishes = () => {
  try {
    return normalizeSelectedDishes(JSON.parse(localStorage.getItem(SELECTED_DISHES_KEY) ?? "null"));
  } catch {
    return DEFAULT_SELECTED_DISHES;
  }
};

const writeSelectedDishes = (selectedDishes: string[]) => {
  try {
    localStorage.setItem(SELECTED_DISHES_KEY, JSON.stringify(selectedDishes));
  } catch {
    // Storage can be unavailable; selection should still work for the current session.
  }
};

const buildResultUrl = (selectedDishes: string[]) => {
  const params = new URLSearchParams({
    selectedDishes: selectedDishes.join(","),
    variant: String(nextResultVariant()),
  });
  return `/result?${params.toString()}`;
};

export default function HomePage() {
  const router = useRouter();
  const [selectedDishes, setSelectedDishes] = useState<string[]>(DEFAULT_SELECTED_DISHES);
  const [engagement, setEngagement] = useState<DishEngagement>({ liked: [], saved: [] });
  const [filter, setFilter] = useState<"all" | "saved">("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedDishes(readSelectedDishes());
    try {
      setEngagement(readDishEngagement(localStorage));
    } catch {
      setEngagement({ liked: [], saved: [] });
    }
  }, []);

  const visibleDishes = useMemo(
    () =>
      filter === "saved"
        ? HOME_DISHES.filter((dish) => engagement.saved.includes(dish.name))
        : HOME_DISHES,
    [engagement.saved, filter]
  );

  const selectedSummary = selectedDishes.slice(0, 2).join("、");
  const selectedMoreCount = Math.max(0, selectedDishes.length - 2);

  const setAndPersistSelectedDishes = (next: string[]) => {
    setSelectedDishes(next);
    writeSelectedDishes(next);
  };

  const toggleDish = (dishName: string) => {
    setAndPersistSelectedDishes(
      selectedDishes.includes(dishName)
        ? selectedDishes.filter((name) => name !== dishName)
        : [...selectedDishes, dishName].slice(0, 12)
    );
  };

  const restoreRecommendation = () => {
    setAndPersistSelectedDishes(DEFAULT_SELECTED_DISHES);
  };

  const toggleEngagement = (key: keyof DishEngagement, dishName: string) => {
    try {
      setEngagement(toggleDishEngagement(localStorage, key, dishName));
    } catch {
      setEngagement((current) => {
        const exists = current[key].includes(dishName);
        return {
          ...current,
          [key]: exists
            ? current[key].filter((name) => name !== dishName)
            : [...current[key], dishName],
        };
      });
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
        <div>
          <p className="home-kicker">今天吃什么</p>
          <h1>点几道想吃的菜</h1>
          <p>选菜、点赞、收藏，马上生成一份能照着做的菜谱。</p>
        </div>
        <div className="home-count" aria-label={`当前已选 ${selectedDishes.length} 道菜`}>
          <strong>{selectedDishes.length}</strong>
          <span>已选</span>
        </div>
      </header>

      <section className="home-toolbar" aria-label="菜品筛选">
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
        <button type="button" className="home-link-btn" onClick={restoreRecommendation}>
          推荐组合
        </button>
      </section>

      <section className="dish-picker-section" aria-label="选择今天想吃的菜">
        {visibleDishes.length ? (
          <div className="dish-grid">
            {visibleDishes.map((dish) => {
              const selected = selectedDishes.includes(dish.name);
              const liked = engagement.liked.includes(dish.name);
              const saved = engagement.saved.includes(dish.name);

              return (
                <article key={dish.name} className={`dish-card${selected ? " selected" : ""}`}>
                  <button
                    type="button"
                    className="dish-select"
                    aria-pressed={selected}
                    onClick={() => toggleDish(dish.name)}
                  >
                    <span className="dish-status">{selected ? "已选" : "可选"}</span>
                    <span className="dish-name">{dish.name}</span>
                    <span className="dish-meta">
                      {dish.category} · {dish.time} 分钟
                    </span>
                    <span className="dish-note">{dish.note}</span>
                  </button>

                  <div className="dish-actions">
                    <button
                      type="button"
                      className={liked ? "active" : ""}
                      aria-pressed={liked}
                      aria-label={`${liked ? "取消点赞" : "点赞"}${dish.name}`}
                      onClick={() => toggleEngagement("liked", dish.name)}
                    >
                      赞
                    </button>
                    <button
                      type="button"
                      className={saved ? "active" : ""}
                      aria-pressed={saved}
                      aria-label={`${saved ? "取消收藏" : "收藏"}${dish.name}`}
                      onClick={() => toggleEngagement("saved", dish.name)}
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
              : "点菜卡就能加入菜单"}
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
