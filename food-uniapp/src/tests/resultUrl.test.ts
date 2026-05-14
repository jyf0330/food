import { describe, expect, it } from "vitest";
import { buildResultPageUrl, parseResultQuery, withResultPlanIndex } from "@/domain/resultUrl";

describe("result url", () => {
  it("round-trips selected dishes and generation options", () => {
    const url = buildResultPageUrl({
      selected_dishes: ["番茄炒蛋", "土豆焖鸡"],
      favorite_foods: ["番茄炒蛋", "土豆焖鸡"],
      variant: 123,
      budget: 90,
    });
    const query: Record<string, string> = {};
    new URL(`http://local${url}`).searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const parsed = parseResultQuery(query);

    expect(url.startsWith("/pages/result/result?")).toBe(true);
    expect(parsed.selected_dishes).toEqual(["番茄炒蛋", "土豆焖鸡"]);
    expect(parsed.favorite_foods).toEqual(["番茄炒蛋", "土豆焖鸡"]);
    expect(parsed.variant).toBe(123);
    expect(parsed.budget).toBe(90);
  });

  it("updates plan index without losing the current query", () => {
    const url = buildResultPageUrl({ selected_dishes: ["番茄炒蛋"], variant: 2 });
    const next = withResultPlanIndex(url, 1);
    const params = new URL(`http://local${next}`).searchParams;

    expect(params.get("planIndex")).toBe("1");
    expect(params.get("variant")).toBe("2");
  });
});
