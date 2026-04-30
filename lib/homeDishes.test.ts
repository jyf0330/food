import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_HOME_DISH_NAMES,
  normalizeHomeDishNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes,
  type HomeDish,
} from "./homeDishes";

describe("home dishes", () => {
  it("refreshes only dishes that are not selected", () => {
    const current = DEFAULT_HOME_DISH_NAMES.slice(0, 12);
    const selected = [current[0], current[3], current[8]];
    const refreshed = refreshUnselectedHomeDishes(current, selected, 7);

    assert.equal(refreshed.length, current.length);
    assert.equal(refreshed[0], current[0]);
    assert.equal(refreshed[3], current[3]);
    assert.equal(refreshed[8], current[8]);
    assert.notDeepEqual(refreshed, current);
  });

  it("keeps a full unique list after refresh", () => {
    const current = DEFAULT_HOME_DISH_NAMES.slice(0, 12);
    const refreshed = refreshUnselectedHomeDishes(current, current.slice(0, 4), 18);

    assert.equal(new Set(refreshed).size, refreshed.length);
    assert.equal(refreshed.length, 12);
  });

  it("keeps an explicitly empty selected list empty when restoring", () => {
    assert.deepEqual(
      normalizeHomeDishNames([], DEFAULT_HOME_DISH_NAMES.slice(0, 4), { allowEmpty: true }),
      []
    );
  });

  it("searches dishes by name, category and note", () => {
    const dishes: HomeDish[] = [
      { name: "番茄炒蛋", category: "快手菜", time: 10, note: "酸甜下饭" },
      { name: "紫菜蛋花汤", category: "汤", time: 8, note: "热乎有汤" },
      { name: "白灼芥兰", category: "蔬菜", time: 12, note: "清爽快手" },
    ];

    assert.deepEqual(searchHomeDishes(dishes, "番茄").map((dish) => dish.name), ["番茄炒蛋"]);
    assert.deepEqual(searchHomeDishes(dishes, " 汤 ").map((dish) => dish.name), ["紫菜蛋花汤"]);
    assert.deepEqual(searchHomeDishes(dishes, "快手").map((dish) => dish.name), [
      "番茄炒蛋",
      "白灼芥兰",
    ]);
  });
});
