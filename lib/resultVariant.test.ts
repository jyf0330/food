import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextResultVariant } from "./resultVariant";

describe("nextResultVariant", () => {
  it("changes the result variant with time and jitter", () => {
    assert.equal(nextResultVariant(1000, 0), 1000);
    assert.equal(nextResultVariant(1000, 0.5), 501000);
    assert.notEqual(nextResultVariant(1000, 0), nextResultVariant(1001, 0));
  });

  it("never returns a non-positive variant", () => {
    assert.equal(nextResultVariant(0, 0), 1);
  });
});
