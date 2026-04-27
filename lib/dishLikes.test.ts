import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDishLikeSnapshot,
  recordDishLike,
  type DishLikeStore,
} from "./dishLikes";

describe("dish likes", () => {
  it("allows one like per user per dish per day", () => {
    const store: DishLikeStore = {};

    const first = recordDishLike(store, "番茄炒蛋", "user-a", "2026-04-28");
    const second = recordDishLike(store, "番茄炒蛋", "user-a", "2026-04-28");
    const nextDay = recordDishLike(store, "番茄炒蛋", "user-a", "2026-04-29");

    assert.equal(first.accepted, true);
    assert.equal(first.count, 1);
    assert.equal(second.accepted, false);
    assert.equal(second.count, 1);
    assert.equal(nextDay.accepted, true);
    assert.equal(nextDay.count, 2);
  });

  it("builds count snapshots for requested dishes", () => {
    const store: DishLikeStore = {};
    recordDishLike(store, "番茄炒蛋", "user-a", "2026-04-28");
    recordDishLike(store, "番茄炒蛋", "user-b", "2026-04-28");

    assert.deepEqual(buildDishLikeSnapshot(store, ["番茄炒蛋", "蒜蓉菜心"]), {
      番茄炒蛋: 2,
      蒜蓉菜心: 0,
    });
  });
});
