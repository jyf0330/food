export type DishLikeStore = Record<
  string,
  {
    count: number;
    usersByDate: Record<string, string[]>;
  }
>;

export type DishLikeResult = {
  accepted: boolean;
  count: number;
};

function cleanName(value: string): string {
  return value.trim().slice(0, 48);
}

function cleanUserId(value: string): string {
  return value.trim().slice(0, 80);
}

export function recordDishLike(
  store: DishLikeStore,
  dishName: string,
  userId: string,
  dateKey: string
): DishLikeResult {
  const name = cleanName(dishName);
  const user = cleanUserId(userId);
  if (!name || !user || !dateKey) {
    return { accepted: false, count: 0 };
  }

  const row = store[name] ?? { count: 0, usersByDate: {} };
  const users = new Set(row.usersByDate[dateKey] ?? []);
  if (users.has(user)) {
    store[name] = row;
    return { accepted: false, count: row.count };
  }

  users.add(user);
  const nextRow = {
    count: row.count + 1,
    usersByDate: {
      ...row.usersByDate,
      [dateKey]: Array.from(users),
    },
  };
  store[name] = nextRow;

  return { accepted: true, count: nextRow.count };
}

export function buildDishLikeSnapshot(
  store: DishLikeStore,
  dishNames: string[]
): Record<string, number> {
  return Object.fromEntries(dishNames.map((name) => [name, store[name]?.count ?? 0]));
}
