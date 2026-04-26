export type MealMemoryForm = {
  people: number;
  family: string;
  budget: number;
  time: number;
  taste: string[];
  channel: string;
  avoid: string[];
  finishTime: string;
  cookSpeed: string;
  userId: string;
  favoriteFoods: string[];
  selectedDishes: string[];
};

export type MealChoice = {
  planIndex: number;
  planTitle: string;
  planType: string;
  resultUrl: string;
  form: MealMemoryForm;
  savedAt: string;
};

type MealChoiceInput = Omit<MealChoice, "savedAt"> & {
  savedAt?: string;
};

type MealChoiceStorage = Pick<Storage, "setItem">;

export const LAST_CHOICE_KEY = "san-zhuo-cai:last-choice";

export function resultUrlWithPlanIndex(resultUrl: string, planIndex: number): string {
  try {
    const isAbsolute = /^https?:\/\//.test(resultUrl);
    const url = new URL(resultUrl, "http://local.invalid");
    url.searchParams.set("planIndex", String(planIndex));
    return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return resultUrl;
  }
}

export function rememberMealChoice(
  storage: MealChoiceStorage,
  input: MealChoiceInput
): MealChoice {
  const choice: MealChoice = {
    ...input,
    resultUrl: resultUrlWithPlanIndex(input.resultUrl, input.planIndex),
    savedAt: input.savedAt ?? new Date().toISOString(),
  };

  storage.setItem(LAST_CHOICE_KEY, JSON.stringify(choice));
  return choice;
}

export function restoreHomeForm(
  savedForm: MealMemoryForm | null,
  rememberedChoiceForm: MealMemoryForm | null,
  cookieUserId: string
): MealMemoryForm | null {
  const restored = savedForm ?? rememberedChoiceForm;
  if (!restored) return null;
  if (restored.userId || !cookieUserId) return restored;
  return { ...restored, userId: cookieUserId };
}
