import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { NextResponse } from "next/server";
import {
  buildDishLikeSnapshot,
  recordDishLike,
  type DishLikeStore,
} from "@/lib/dishLikes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STORE_PATH = process.env.DISH_LIKES_FILE || "/tmp/food-dish-likes.json";

async function readStore(): Promise<DishLikeStore> {
  try {
    return JSON.parse(await readFile(STORE_PATH, "utf8")) as DishLikeStore;
  } catch {
    return {};
  }
}

async function writeStore(store: DishLikeStore) {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store), "utf8");
}

function normalizeDishNames(value: string | null): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 80)
    )
  );
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDateKey(value: unknown): string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : todayKey();
}

function likedByUser(store: DishLikeStore, dishNames: string[], userId: string, dateKey: string) {
  if (!userId) return [];
  return dishNames.filter((name) => store[name]?.usersByDate[dateKey]?.includes(userId));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dishNames = normalizeDishNames(url.searchParams.get("dishes"));
  const userId = (url.searchParams.get("userId") ?? "").trim();
  const dateKey = normalizeDateKey(url.searchParams.get("date"));
  const store = await readStore();

  return NextResponse.json({
    counts: buildDishLikeSnapshot(store, dishNames),
    liked: likedByUser(store, dishNames, userId, dateKey),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      dishName?: unknown;
      userId?: unknown;
      date?: unknown;
    };
    const dishName = typeof body.dishName === "string" ? body.dishName : "";
    const userId = typeof body.userId === "string" ? body.userId : "";
    const dateKey = normalizeDateKey(body.date);
    const store = await readStore();
    const result = recordDishLike(store, dishName, userId, dateKey);

    if (result.accepted) {
      await writeStore(store);
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
}
