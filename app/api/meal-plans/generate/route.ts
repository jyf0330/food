import { NextResponse } from "next/server";
import { buildGenerateResponse } from "@/lib/mealPlanGenerator";
import type { GenerateRequest } from "@/lib/types";
import { buildPrefixedUserId } from "@/lib/userIdentity";

function normalizeRequest(input: Partial<GenerateRequest> & { userId?: string }): GenerateRequest {
  return {
    city: input.city || "深圳",
    people_count: Number(input.people_count) || 3,
    has_child: !!input.has_child,
    has_elder: !!input.has_elder,
    budget: Number(input.budget) || 80,
    meal_type: input.meal_type || "晚餐",
    taste: Array.isArray(input.taste) ? input.taste : [],
    avoid: Array.isArray(input.avoid) ? input.avoid : [],
    time_limit: Number(input.time_limit) || 40,
    finish_time: input.finish_time,
    cook_speed: input.cook_speed,
    variant: Math.max(0, Number(input.variant) || 0),
    user_id: buildPrefixedUserId(input.user_id ?? input.userId),
    shopping_channel: input.shopping_channel || "菜市场",
    kitchen_tools: Array.isArray(input.kitchen_tools)
      ? input.kitchen_tools
      : ["炒锅", "电饭锅"],
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GenerateRequest>;
    const response = buildGenerateResponse(normalizeRequest(body));

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
}
