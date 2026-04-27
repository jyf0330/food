import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISH_ENGAGEMENT_KEY,
  readDishEngagement,
  toggleDishEngagement,
  writeDishEngagement,
} from "./dishEngagement";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("dish engagement", () => {
  it("persists liked and saved dish names", () => {
    const storage = new MemoryStorage();

    const next = writeDishEngagement(storage, {
      liked: ["番茄炒蛋", "", "番茄炒蛋"],
      saved: ["蒜蓉菜心"],
    });

    assert.deepEqual(next, {
      liked: ["番茄炒蛋"],
      saved: ["蒜蓉菜心"],
    });
    assert.equal(
      storage.getItem(DISH_ENGAGEMENT_KEY),
      JSON.stringify({ liked: ["番茄炒蛋"], saved: ["蒜蓉菜心"] })
    );
    assert.deepEqual(readDishEngagement(storage), next);
  });

  it("toggles one dish without disturbing the other list", () => {
    const storage = new MemoryStorage();
    writeDishEngagement(storage, {
      liked: ["番茄炒蛋"],
      saved: ["蒜蓉菜心"],
    });

    const next = toggleDishEngagement(storage, "saved", "番茄炒蛋");

    assert.deepEqual(next, {
      liked: ["番茄炒蛋"],
      saved: ["蒜蓉菜心", "番茄炒蛋"],
    });
  });
});
