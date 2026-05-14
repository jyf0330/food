import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_COUNT,
  dailyHomeDishNames,
  normalizeHomeDishNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes,
  type HomeDish,
} from "./homeDishes";

describe("home dishes", () => {
  it("refreshes only dishes that are not selected", () => {
    const current = DEFAULT_HOME_DISH_NAMES;
    const selected = [current[0], current[3]];
    const refreshed = refreshUnselectedHomeDishes(current, selected, 7);

    assert.equal(refreshed.length, current.length);
    assert.equal(refreshed[0], current[0]);
    assert.equal(refreshed[3], current[3]);
    assert.notDeepEqual(refreshed, current);
  });

  it("keeps a full unique list after refresh", () => {
    const current = DEFAULT_HOME_DISH_NAMES;
    const refreshed = refreshUnselectedHomeDishes(current, current.slice(0, 2), 18);

    assert.equal(new Set(refreshed).size, refreshed.length);
    assert.equal(refreshed.length, HOME_DISH_COUNT);
  });

  it("keeps daily home dishes stable for a day and different across days", () => {
    const firstDay = dailyHomeDishNames(new Date(2026, 4, 15));
    const sameDay = dailyHomeDishNames(new Date(2026, 4, 15, 20));
    const nextDay = dailyHomeDishNames(new Date(2026, 4, 16));

    assert.equal(firstDay.length, HOME_DISH_COUNT);
    assert.deepEqual(firstDay, sameDay);
    assert.notDeepEqual(firstDay, nextDay);
  });

  it("keeps an explicitly empty selected list empty when restoring", () => {
    assert.deepEqual(
      normalizeHomeDishNames([], DEFAULT_HOME_DISH_NAMES.slice(0, 4), { allowEmpty: true }),
      []
    );
  });

  it("searches dishes by name, category and note", () => {
    const dishes: HomeDish[] = [
      {
        name: "番茄炒蛋",
        category: "快手菜",
        time: 10,
        note: "酸甜下饭",
        searchKeywords: ["番茄炒蛋", "快手菜", "酸甜下饭", "番茄", "鸡蛋"],
      },
      {
        name: "紫菜蛋花汤",
        category: "汤",
        time: 8,
        note: "热乎有汤",
        searchKeywords: ["紫菜蛋花汤", "汤", "热乎有汤", "紫菜", "鸡蛋"],
      },
      {
        name: "白灼芥兰",
        category: "蔬菜",
        time: 12,
        note: "清爽快手",
        searchKeywords: ["白灼芥兰", "蔬菜", "清爽快手", "芥兰"],
      },
    ];

    assert.deepEqual(searchHomeDishes(dishes, "番茄").map((dish) => dish.name), ["番茄炒蛋"]);
    assert.deepEqual(searchHomeDishes(dishes, " 汤 ").map((dish) => dish.name), ["紫菜蛋花汤"]);
    assert.deepEqual(searchHomeDishes(dishes, "快手").map((dish) => dish.name), [
      "番茄炒蛋",
      "白灼芥兰",
    ]);
    assert.deepEqual(searchHomeDishes(dishes, "鸡蛋").map((dish) => dish.name), [
      "番茄炒蛋",
      "紫菜蛋花汤",
    ]);
    assert.deepEqual(searchHomeDishes(dishes, "鸡蛋 汤").map((dish) => dish.name), [
      "紫菜蛋花汤",
    ]);
  });
});
