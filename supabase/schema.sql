-- ============================================================================
-- 今天吃什么 - Supabase / Postgres schema
-- 基于 docs/PRD.md 第 16 章整理
-- 在 Supabase SQL Editor 里整段执行即可
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. dishes 菜品表 -----------------------------------------------------------
create table if not exists dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,                 -- 荤菜/素菜/汤/蛋类/豆腐/主食
  cuisine text,                           -- 广东家常/川湘/家常菜/减脂/儿童
  difficulty int check (difficulty between 1 and 5),
  time_minutes int,
  taste text[],
  suitable_people text[],
  tags text[],
  is_spicy boolean default false,
  kid_friendly boolean default false,
  elder_friendly boolean default false,
  budget_level text,                      -- 低/中/高
  method text[],
  season_months int[],                    -- 1..12
  created_at timestamp default now()
);
create index if not exists idx_dishes_category on dishes (category);
create index if not exists idx_dishes_cuisine on dishes (cuisine);

-- 2. ingredients 食材表 ------------------------------------------------------
create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,                          -- 蔬菜/肉/蛋/海鲜/豆制品/调料/干货
  aliases text[],
  common_units text[],
  region text[],
  season_months int[],
  storage_days int,
  search_keywords text[],
  created_at timestamp default now()
);
create index if not exists idx_ingredients_category on ingredients (category);

-- 3. ingredient_prices 食材价格表 -------------------------------------------
create table if not exists ingredient_prices (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid references ingredients(id) on delete cascade,
  city text,
  source text,                            -- 深圳开放数据/农业农村部/用户反馈…
  price_min numeric,
  price_max numeric,
  price_avg numeric,
  unit text,
  date date,
  confidence text,                        -- 高/中/低
  created_at timestamp default now()
);
create index if not exists idx_prices_ingredient on ingredient_prices (ingredient_id);
create index if not exists idx_prices_date on ingredient_prices (date);

-- 4. dish_ingredients 菜品食材关联表 ----------------------------------------
create table if not exists dish_ingredients (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid references dishes(id) on delete cascade,
  ingredient_id uuid references ingredients(id) on delete cascade,
  amount_per_person text,
  amount_for_2 text,
  amount_for_3 text,
  amount_for_4 text,
  required boolean default true
);
create index if not exists idx_di_dish on dish_ingredients (dish_id);
create index if not exists idx_di_ing on dish_ingredients (ingredient_id);

-- 5. recipes 做法表 ----------------------------------------------------------
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid references dishes(id) on delete cascade,
  version text,                           -- 新手版/快手版/少油版/儿童版/老人版
  steps jsonb,
  tips text[],
  created_at timestamp default now()
);
create index if not exists idx_recipes_dish on recipes (dish_id);

-- 6. user_profiles 家庭偏好表 -----------------------------------------------
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  city text,
  people_count int,
  has_child boolean,
  has_elder boolean,
  avoid_foods text[],
  taste_preference text[],
  budget_default int,
  kitchen_tools text[],
  created_at timestamp default now()
);
create index if not exists idx_profiles_user on user_profiles (user_id);

-- 7. meal_plans 生成记录表 ---------------------------------------------------
create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  request jsonb,
  result jsonb,
  created_at timestamp default now()
);
create index if not exists idx_plans_user on meal_plans (user_id);
create index if not exists idx_plans_created on meal_plans (created_at desc);

-- 8. availability_sources 今日可买来源表 ------------------------------------
create table if not exists availability_sources (
  id uuid primary key default gen_random_uuid(),
  ingredient_name text,
  source text,                            -- 朴朴/沃尔玛/盒马/菜市场…
  city text,
  area text,
  available boolean,
  price_text text,
  date date,
  data_method text,                       -- 用户截图/OCR/用户反馈/人工
  confidence text
);
create index if not exists idx_avail_name_date on availability_sources (ingredient_name, date);

-- 9. historical_ingredient_baseline 去年同期基线表 --------------------------
create table if not exists historical_ingredient_baseline (
  id uuid primary key default gen_random_uuid(),
  ingredient_name text not null,
  city text default '深圳',
  month int not null check (month between 1 and 12),
  source text,
  avg_price numeric,
  price_min numeric,
  price_max numeric,
  unit text,
  season_score int,                       -- 0-100
  availability_score int,                 -- 0-100
  recommend_score int,                    -- 0-100
  updated_at timestamp default now(),
  unique (ingredient_name, city, month)
);

-- 10. current_adjustment 当前修正表 -----------------------------------------
create table if not exists current_adjustment (
  id uuid primary key default gen_random_uuid(),
  ingredient_name text,
  city text default '深圳',
  date date,
  price_adjustment numeric,               -- 1.08 表示比去年同期贵 8%
  availability_adjustment int,            -- 调整 availability_score 的增减值
  reason text,
  source text
);
create index if not exists idx_adj_name_date on current_adjustment (ingredient_name, date);

-- 11. daily_ingredient_pool 今日推荐食材池 ----------------------------------
create table if not exists daily_ingredient_pool (
  id uuid primary key default gen_random_uuid(),
  city text default '深圳',
  date date,
  ingredient_name text,
  category text,
  season_score int,
  price_level text,                       -- 便宜/正常/偏贵/很贵
  availability_score int,
  recommend_score int,
  reason text,
  suitable_dishes text[],
  sources text[],
  created_at timestamp default now()
);
create index if not exists idx_pool_city_date on daily_ingredient_pool (city, date);

-- 12. user_feedback 用户反馈表 -----------------------------------------------
create table if not exists user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  ingredient_name text,
  city text,
  area text,
  channel text,                           -- 朴朴/沃尔玛/盒马/菜市场/美团买菜
  feedback_type text,                     -- 买到了/没买到/太贵了/便宜/品质好/品质差
  price_text text,
  note text,
  created_at timestamp default now()
);
create index if not exists idx_feedback_name on user_feedback (ingredient_name);
create index if not exists idx_feedback_created on user_feedback (created_at desc);

-- ============================================================================
-- 完成。下一步用 data/*.seed.json 做首次导入。
-- ============================================================================
