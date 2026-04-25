import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPrefixedUserId, getUserIdDisplay } from "./userIdentity";

describe("user identity", () => {
  it("keeps Chinese user ids but stores them with an internal prefix", () => {
    assert.equal(getUserIdDisplay("  小王妈妈  "), "小王妈妈");
    assert.equal(buildPrefixedUserId("小王妈妈"), "jtcsm_小王妈妈");
  });

  it("does not show the internal prefix back on the page", () => {
    assert.equal(getUserIdDisplay("jtcsm_龙岗爸爸"), "龙岗爸爸");
  });

  it("removes unsafe separator characters while preserving readable ids", () => {
    assert.equal(buildPrefixedUserId(" 张 三/@南山 "), "jtcsm_张三南山");
  });
});
