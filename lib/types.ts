export type BudgetLevel = "低" | "中" | "高";
export type PriceLevel = "便宜" | "正常" | "偏贵" | "很贵";
export type Cuisine = "广东家常" | "川湘" | "家常菜" | "减脂" | "儿童" | "全国通用";
export type DishCategory =
  | "荤菜"
  | "素菜"
  | "汤"
  | "蛋类"
  | "豆腐"
  | "主食"
  | "凉菜"
  | "蒸菜";

export interface Dish {
  dish_name: string;
  category: DishCategory;
  cuisine: Cuisine;
  region_style?: string[];
  suitable_people?: string[];
  meal_type?: ("早餐" | "午餐" | "晚餐")[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  time_minutes: number;
  taste: string[];
  main_ingredients: string[];
  optional_ingredients?: string[];
  season?: (string | number)[];
  tools?: string[];
  cooking_methods?: string[];
  estimated_cost_level: BudgetLevel;
  kid_friendly: boolean;
  elder_friendly: boolean;
  avoid_tags?: string[];
  steps: string[];
  shopping_amount_for_3_people?: { name: string; amount: string }[];
}

export interface Ingredient {
  standard_name: string;
  aliases: string[];
  category: string;
  common_units: string[];
  storage_days: number;
  season_months: number[];
  platform_keywords: {
    朴朴?: string[];
    沃尔玛?: string[];
    盒马?: string[];
    菜市场?: string[];
    美团买菜?: string[];
    楼下超市?: string[];
  };
}

export interface GenerateRequest {
  city: string;
  people_count: number;
  adults?: number;
  children?: number;
  elders?: number;
  has_child?: boolean;
  has_elder?: boolean;
  budget: number;
  meal_type: "早餐" | "午餐" | "晚餐";
  taste: string[];
  avoid: string[];
  time_limit: number;
  finish_time?: string;
  cook_speed?: "normal" | "slow" | "beginner";
  variant?: number;
  user_id?: string;
  shopping_channel: string;
  kitchen_tools: string[];
}

export interface DishInPlan {
  name: string;
  category?: DishCategory;
  reason: string;
  ingredients?: { name: string; amount: string }[];
  steps?: string[];
  tips?: string[];
}

export interface ShoppingGroup {
  category: string;
  items: { name: string; amount: string; search_keywords?: string[] }[];
}

export interface MealPlan {
  type: "省钱快手型" | "营养均衡型" | "孩子老人友好型" | "改善伙食型";
  title: string;
  estimated_cost: number;
  total_time: number;
  suitable_for: string[];
  dishes: DishInPlan[];
  shopping_list: ShoppingGroup[];
  cooking_order: string[];
  finish_time?: string;
  cook_speed?: GenerateRequest["cook_speed"];
  cooking_schedule?: { time: string; task: string }[];
  replacement_suggestions?: { old: string; new_options: string[] }[];
  reason: string;
}

export interface GenerateResponse {
  plans: MealPlan[];
  daily_recommended: string[];
  daily_not_recommended: { name: string; reason: string }[];
}
