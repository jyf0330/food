import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appendResultPlanIndex, buildResultUrl } from "./resultUrl";

describe("buildResultUrl", () => {
  it("keeps dish separators as literal commas so shared result pages resolve", () => {
    const url = buildResultUrl(["番茄炒蛋", "蒜蓉菜心"], 3);

    assert.equal(
      url,
      "/result?selectedDishes=%E7%95%AA%E8%8C%84%E7%82%92%E8%9B%8B,%E8%92%9C%E8%93%89%E8%8F%9C%E5%BF%83&variant=3"
    );
    assert.doesNotMatch(url, /%2C/i);
  });
});

describe("appendResultPlanIndex", () => {
  it("adds the selected plan without re-encoding the selected dish separator", () => {
    const url = appendResultPlanIndex(
      "http://127.0.0.1:3000/result?selectedDishes=%E7%95%AA%E8%8C%84%E7%82%92%E8%9B%8B,%E8%92%9C%E8%93%89%E8%8F%9C%E5%BF%83&variant=3",
      1
    );

    assert.equal(
      url,
      "http://127.0.0.1:3000/result?selectedDishes=%E7%95%AA%E8%8C%84%E7%82%92%E8%9B%8B,%E8%92%9C%E8%93%89%E8%8F%9C%E5%BF%83&variant=3&planIndex=1"
    );
    assert.doesNotMatch(url, /%2C/i);
  });

  it("replaces an existing selected plan index", () => {
    const url = appendResultPlanIndex(
      "http://127.0.0.1:3000/result?selectedDishes=%E7%95%AA%E8%8C%84%E7%82%92%E8%9B%8B,%E8%92%9C%E8%93%89%E8%8F%9C%E5%BF%83&variant=3&planIndex=0",
      2
    );

    assert.equal(
      url,
      "http://127.0.0.1:3000/result?selectedDishes=%E7%95%AA%E8%8C%84%E7%82%92%E8%9B%8B,%E8%92%9C%E8%93%89%E8%8F%9C%E5%BF%83&variant=3&planIndex=2"
    );
  });
});
