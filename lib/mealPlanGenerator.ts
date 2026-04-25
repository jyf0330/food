import { getMockPlans } from "./mockPlans";
import type { GenerateRequest, GenerateResponse } from "./types";
import { getDailyNotRecommended, getDailyRecommended } from "./foodInsights";

export function buildGenerateResponse(req: GenerateRequest): GenerateResponse {
  return {
    plans: getMockPlans(req),
    daily_recommended: getDailyRecommended(),
    daily_not_recommended: getDailyNotRecommended(),
  };
}
