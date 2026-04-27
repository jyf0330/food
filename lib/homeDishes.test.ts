import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_HOME_DISH_NAMES, refreshUnselectedHomeDishes } from "./homeDishes";

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
});
