const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const {
  DEFAULT_HOME_DISH_NAMES,
  homeDishesFromNames,
  normalizeHomeDishNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes
} = require("./homeDishes");

describe("mini program home dish picker", () => {
  it("keeps selected dishes during refresh", () => {
    const current = DEFAULT_HOME_DISH_NAMES.slice(0, 12);
    const selected = current.slice(0, 4);
    const refreshed = refreshUnselectedHomeDishes(current, selected, 9);

    assert.deepEqual(refreshed.slice(0, 4), selected);
    assert.equal(new Set(refreshed).size, refreshed.length);
  });

  it("normalizes stored dish names and allows an empty selection", () => {
    assert.deepEqual(
      normalizeHomeDishNames(["番茄炒蛋", "不存在", "番茄炒蛋"], DEFAULT_HOME_DISH_NAMES),
      ["番茄炒蛋"]
    );
    assert.deepEqual(
      normalizeHomeDishNames([], DEFAULT_HOME_DISH_NAMES.slice(0, 4), { allowEmpty: true }),
      []
    );
  });

  it("searches by dish name, category, note and ingredients", () => {
    const dishes = homeDishesFromNames(["番茄炒蛋", "紫菜蛋花汤", "蒜蓉菜心"]);

    assert.deepEqual(searchHomeDishes(dishes, "番茄").map((dish) => dish.name), ["番茄炒蛋"]);
    assert.deepEqual(searchHomeDishes(dishes, "汤").map((dish) => dish.name), ["紫菜蛋花汤"]);
    assert.deepEqual(searchHomeDishes(dishes, "鸡蛋").map((dish) => dish.name), [
      "番茄炒蛋",
      "紫菜蛋花汤"
    ]);
  });
});
