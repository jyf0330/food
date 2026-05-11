export function buildResultUrl(selectedDishes: string[], variant: number): string {
  const dishes = selectedDishes.map((dish) => encodeURIComponent(dish)).join(",");
  return `/result?selectedDishes=${dishes}&variant=${encodeURIComponent(String(variant))}`;
}

export function appendResultPlanIndex(href: string, planIndex: number): string {
  const [withoutHash, hash] = href.split("#", 2);
  const [path, rawQuery = ""] = withoutHash.split("?", 2);
  const query = rawQuery
    .split("&")
    .filter((part) => part && !part.startsWith("planIndex="));

  query.push(`planIndex=${encodeURIComponent(String(planIndex))}`);

  return `${path}?${query.join("&")}${hash !== undefined ? `#${hash}` : ""}`;
}
