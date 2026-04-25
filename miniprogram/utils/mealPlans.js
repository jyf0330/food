const curatedData = require("./curatedData");

const RECIPE_STEPS = {
  番茄炒蛋: [
    "番茄切块，鸡蛋打散后加少许盐。",
    "热锅加油，先把鸡蛋炒到半凝固后盛出。",
    "锅里补一点油，下番茄炒出汁，可以加少许糖提鲜。",
    "倒回鸡蛋快速翻炒，加盐调味后出锅。"
  ],
  土豆焖鸡: [
    "鸡腿切块，冷水下锅焯出血沫后捞出。",
    "土豆去皮切块，姜蒜切片备用。",
    "热油爆香姜蒜，下鸡块炒到表面微黄。",
    "加生抽、少许老抽和糖炒匀，再加热水没过食材。",
    "下土豆焖 20 分钟，最后大火收汁。"
  ],
  蒜蓉生菜: [
    "生菜掰开洗净，沥干水分。",
    "蒜切末，热锅冷油小火炒香蒜末。",
    "转大火下生菜快速翻炒 30 秒。",
    "加盐和少许生抽调味，菜叶刚变软就出锅。"
  ],
  紫菜蛋花汤: [
    "紫菜撕小块放入碗里，鸡蛋打散。",
    "锅里烧开水，加入少许盐调底味。",
    "关小火后淋入蛋液，形成蛋花。",
    "倒入紫菜，滴几滴香油，撒葱花即可。"
  ],
  清蒸鲈鱼: [
    "鲈鱼洗净，两面斜划几刀，鱼身和鱼肚放姜片。",
    "水开后把鱼上锅，大火蒸 8 分钟左右。",
    "倒掉盘中腥水，铺上新鲜葱丝。",
    "淋蒸鱼豉油，再浇一勺热油激香。"
  ],
  玉米胡萝卜排骨汤: [
    "排骨冷水下锅焯水，捞出冲净浮沫。",
    "玉米切段，胡萝卜切滚刀块。",
    "汤锅加水，下排骨、玉米、胡萝卜和姜片。",
    "大火煮开后转中小火炖 35 分钟，加盐调味。"
  ],
  清炒菜心: [
    "菜心洗净，粗梗对半切开方便熟透。",
    "热锅加油，先下蒜末炒香。",
    "下菜心大火快炒，沿锅边淋一点水帮助断生。",
    "加盐调味，菜心变翠绿后马上出锅。"
  ],
  蒜蓉蒸茄子: [
    "茄子切条，放入盘中，上锅蒸 8 分钟。",
    "蒜切末，用热油小火炒香。",
    "加入生抽、少许蚝油和一点糖调成蒜蓉汁。",
    "把蒜蓉汁淋在蒸好的茄子上，撒葱花即可。"
  ],
  肉末蒸蛋: [
    "鸡蛋打散，加入 1.5 倍温水和少许盐搅匀。",
    "蛋液过筛倒入碗中，表面放调好味的肉末。",
    "盖盘子或耐热保鲜膜，冷水上锅。",
    "水开后转中小火蒸 10 分钟，出锅淋少许生抽。"
  ],
  番茄牛肉: [
    "牛肉切片，加料酒、生抽、淀粉和少许油腌 15 分钟。",
    "番茄切块，蒜切末备用。",
    "热油快炒牛肉到变色后盛出。",
    "下蒜末和番茄炒出汁，倒回牛肉。",
    "加盐和少许糖调味，翻炒 1 分钟出锅。"
  ],
  冬瓜肉丸汤: [
    "冬瓜去皮切片，猪肉末加盐、料酒、淀粉搅上劲。",
    "锅里加水和姜片烧开，下冬瓜煮 5 分钟。",
    "转小火，用勺子把肉馅团成丸子下锅。",
    "丸子浮起后再煮 2 分钟，加盐调味。"
  ],
  清炒上海青: [
    "上海青掰开洗净，菜梗和菜叶分开放。",
    "热锅加油，先下蒜末和菜梗翻炒。",
    "菜梗变软后下菜叶继续大火快炒。",
    "加盐调味，菜叶刚塌下去就出锅。"
  ],
  虾仁滑蛋: [
    "虾仁加盐、料酒和少许淀粉抓匀腌 10 分钟。",
    "鸡蛋打散，加少许盐和一点温水。",
    "热锅加油，先把虾仁炒到变色。",
    "倒入蛋液，转中小火推炒到嫩滑凝固。"
  ],
  "梅菜扣肉（半成品微改）": [
    "半成品拆开后连汤汁倒入深盘。",
    "蒸锅水开后上锅蒸 20 分钟。",
    "出锅后把汤汁倒入小锅，按口味加一点生抽或糖收浓。",
    "把浓汁淋回扣肉，撒葱花即可。"
  ],
  白灼芥兰: [
    "芥兰削去老皮，洗净后切段。",
    "锅里烧开水，加盐和几滴油。",
    "下芥兰焯 1 分钟，捞出沥水摆盘。",
    "淋生抽，浇一点蒜香热油。"
  ],
  丝瓜蛋花汤: [
    "丝瓜去皮切滚刀块，鸡蛋打散。",
    "锅里加少许油，下丝瓜翻炒到微微变软。",
    "加热水煮 3 分钟。",
    "淋入蛋液成蛋花，加盐和葱花调味。"
  ]
};

const DAILY_RECOMMENDED = ["番茄", "鸡蛋", "菜心", "冬瓜", "鸡腿", "豆腐"];
const DAILY_NOT_RECOMMENDED = [
  { name: "排骨", reason: "最近偏贵，预算紧时可以先换成鸡腿或肉末" },
  { name: "苦瓜", reason: "有小孩时接受度不稳定，不作为优先推荐" },
  { name: "虾", reason: "预算低或人数多时容易超支" }
];

const SPEED_BUFFER_MINUTES = {
  normal: 0,
  slow: 10,
  beginner: 20
};

const MONTHLY_SEASON = {
  1: ["菜心", "芥兰", "白萝卜", "菠菜", "土豆", "胡萝卜"],
  2: ["菜心", "芥兰", "菠菜", "白菜", "莴笋"],
  3: ["春笋", "韭菜", "菠菜", "豌豆苗", "春菜"],
  4: ["春笋", "韭菜", "芦笋", "豌豆苗", "菜心"],
  5: ["冬瓜", "黄瓜", "番茄", "茄子", "豆角", "丝瓜"],
  6: ["冬瓜", "丝瓜", "苦瓜", "黄瓜", "空心菜", "苋菜"],
  7: ["冬瓜", "丝瓜", "苦瓜", "节瓜", "玉米", "空心菜"],
  8: ["冬瓜", "丝瓜", "茄子", "玉米", "秋葵", "空心菜"],
  9: ["莲藕", "山药", "南瓜", "菌菇", "秋葵"],
  10: ["莲藕", "山药", "南瓜", "芋头", "萝卜", "菜心"],
  11: ["白萝卜", "菜心", "芥兰", "菌菇", "板栗"],
  12: ["白萝卜", "白菜", "菜心", "芥兰", "莴笋"]
};

const GREENHOUSE_BACKUPS = ["番茄", "青瓜", "生菜", "上海青", "西兰花", "金针菇", "绿豆芽", "黄豆芽"];

function currentMonth() {
  return new Date().getMonth() + 1;
}

function currentDay() {
  return new Date().getDate();
}

function nextMonth(month) {
  return month === 12 ? 1 : month + 1;
}

function weeklySeasonalNames(month = currentMonth(), day = currentDay()) {
  const weekOfMonth = Math.min(4, Math.max(1, Math.ceil(day / 7)));
  const current = MONTHLY_SEASON[month] || [];
  const next = MONTHLY_SEASON[nextMonth(month)] || [];
  const start = weekOfMonth - 1;
  return Array.from(new Set(current.slice(start, start + 4).concat(next.slice(0, Math.max(0, 6 - (current.length - start))))));
}

function parseClockTime(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || "");
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatClockTime(totalMinutes) {
  const day = 24 * 60;
  const normalized = ((totalMinutes % day) + day) % day;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function pickScheduleTasks(order, count) {
  if (!order.length) {
    return ["整理食材", "开始备菜", "处理主菜", "准备收尾"].slice(0, count);
  }
  return Array.from({ length: count }, (_, index) => {
    const sourceIndex = Math.round((index * (order.length - 1)) / Math.max(1, count - 1));
    return order[sourceIndex];
  });
}

function addRecipeSteps(plan) {
  return {
    ...plan,
    dishes: plan.dishes.map((dish) => ({
      ...dish,
      steps: RECIPE_STEPS[dish.name] || [
        "食材洗净切好，按买菜清单提前分装。",
        "先处理需要久煮或久蒸的部分，再做快手菜。",
        "出锅前尝味道，根据家人口味补盐或生抽。"
      ]
    }))
  };
}

function addSchedule(plan, request) {
  const finishTime = parseClockTime(request.finish_time) === null ? "12:00" : request.finish_time;
  const cookSpeed = SPEED_BUFFER_MINUTES[request.cook_speed] === undefined ? "normal" : request.cook_speed;
  const finishMinutes = parseClockTime(finishTime);
  const total = plan.total_time + SPEED_BUFFER_MINUTES[cookSpeed];
  const nodeCount = Math.min(6, Math.max(4, plan.cooking_order.length + 1));
  const tasks = pickScheduleTasks(plan.cooking_order, nodeCount - 1);
  const cooking_schedule = tasks.map((task, index) => {
    const offset = Math.round((total * index) / (nodeCount - 1));
    return {
      time: formatClockTime(finishMinutes - total + offset),
      task
    };
  });
  cooking_schedule.push({ time: finishTime, task: "完成收尾，上桌开饭" });

  return {
    ...plan,
    finish_time: finishTime,
    cook_speed: cookSpeed,
    cooking_schedule
  };
}

function getMockPlans(request) {
  const thirdType = request.has_child || request.has_elder ? "孩子老人友好型" : "改善伙食型";
  const planA = {
    type: "省钱快手型",
    title: "番茄鸡蛋土豆鸡腿家常晚餐",
    estimated_cost: Math.min(request.budget, 65),
    total_time: Math.min(request.time_limit, 35),
    dishes: [
      { name: "番茄炒蛋", reason: "便宜快手，孩子接受度高" },
      { name: "土豆焖鸡", reason: "下饭，一锅出，省火" },
      { name: "蒜蓉生菜", reason: "补充蔬菜，3 分钟出锅" },
      { name: "紫菜蛋花汤", reason: "最快的汤，热乎暖胃" }
    ],
    shopping_list: [
      { category: "肉蛋", items: [{ name: "鸡腿", amount: "2 个" }, { name: "鸡蛋", amount: "5 个" }] },
      { category: "蔬菜", items: [{ name: "番茄", amount: "3 个" }, { name: "土豆", amount: "2 个" }, { name: "生菜", amount: "1 斤" }] },
      { category: "干货调料", items: [{ name: "紫菜", amount: "1 小包" }, { name: "葱姜蒜", amount: "适量" }] }
    ],
    cooking_order: ["先洗米煮饭", "鸡腿切块焯水，土豆切块，一起下锅焖", "焖鸡时洗菜、切番茄", "炒番茄鸡蛋", "炒蒜蓉生菜", "最后煮紫菜蛋花汤"],
    reason: "有肉、有蛋、有青菜、有汤，适合工作日快速搞定。"
  };
  const planB = {
    type: "营养均衡型",
    title: "鲈鱼青菜排骨汤营养家宴",
    estimated_cost: Math.min(request.budget, 95),
    total_time: Math.min(request.time_limit + 10, 50),
    dishes: [
      { name: "清蒸鲈鱼", reason: "高蛋白低脂，孩子老人都能吃" },
      { name: "玉米胡萝卜排骨汤", reason: "汤水滋润，适合深圳天气" },
      { name: "清炒菜心", reason: "广东人晚餐标配" },
      { name: "蒜蓉蒸茄子", reason: "下饭，不重油" }
    ],
    shopping_list: [
      { category: "肉蛋海鲜", items: [{ name: "鲈鱼", amount: "1 条" }, { name: "排骨", amount: "半斤" }] },
      { category: "蔬菜", items: [{ name: "菜心", amount: "1 斤" }, { name: "茄子", amount: "2 根" }, { name: "玉米", amount: "1 根" }, { name: "胡萝卜", amount: "1 根" }] }
    ],
    cooking_order: ["先煮米饭", "排骨焯水，加玉米胡萝卜炖汤", "鲈鱼洗净摆盘", "茄子切条备用", "鲈鱼和茄子上锅蒸", "蒸鱼期间炒菜心", "鱼出锅淋豉油浇热油"],
    reason: "有鱼、有汤、有青菜、有下饭菜，营养结构完整。"
  };
  const planKid = {
    type: "孩子老人友好型",
    title: "肉末蒸蛋番茄牛肉冬瓜汤",
    estimated_cost: Math.min(request.budget, 80),
    total_time: Math.min(request.time_limit, 40),
    dishes: [
      { name: "肉末蒸蛋", reason: "软嫩入口，孩子老人都爱吃" },
      { name: "番茄牛肉", reason: "酸甜开胃，好嚼不柴" },
      { name: "冬瓜肉丸汤", reason: "清热祛湿，深圳必备汤水" },
      { name: "清炒上海青", reason: "好咬好消化" }
    ],
    shopping_list: [
      { category: "肉蛋", items: [{ name: "牛肉", amount: "半斤" }, { name: "猪肉末", amount: "3 两" }, { name: "鸡蛋", amount: "4 个" }] },
      { category: "蔬菜", items: [{ name: "番茄", amount: "3 个" }, { name: "冬瓜", amount: "1 斤" }, { name: "上海青", amount: "1 斤" }] }
    ],
    cooking_order: ["先煮米饭", "牛肉切片腌制", "猪肉末调馅，冬瓜切片下锅煮", "蛋液调好上锅蒸", "冬瓜汤快好时下肉丸", "炒番茄牛肉", "最后炒上海青"],
    reason: "蒸蛋、肉丸汤都软烂，一家老小都吃得舒服。"
  };
  const planUpgrade = {
    type: "改善伙食型",
    title: "虾仁滑蛋梅菜扣肉双人小家宴",
    estimated_cost: Math.min(request.budget, 110),
    total_time: Math.min(request.time_limit + 20, 60),
    dishes: [
      { name: "虾仁滑蛋", reason: "嫩滑鲜甜，高蛋白" },
      { name: "梅菜扣肉（半成品微改）", reason: "省时且下饭" },
      { name: "白灼芥兰", reason: "翠绿清爽，衬托油腻" },
      { name: "丝瓜蛋花汤", reason: "清甜解腻" }
    ],
    shopping_list: [
      { category: "肉蛋海鲜", items: [{ name: "鲜虾/虾仁", amount: "半斤" }, { name: "梅菜扣肉半成品", amount: "1 盒" }, { name: "鸡蛋", amount: "4 个" }] },
      { category: "蔬菜", items: [{ name: "芥兰", amount: "半斤" }, { name: "丝瓜", amount: "1 根" }] }
    ],
    cooking_order: ["梅菜扣肉上锅蒸", "煮米饭", "虾仁腌制，鸡蛋打散", "烧水焯芥兰", "炒虾仁滑蛋", "最后煮丝瓜蛋花汤"],
    reason: "半成品扣肉加自炒滑蛋，省力又体面。"
  };

  return [planA, planB, thirdType === "孩子老人友好型" ? planKid : planUpgrade]
    .map(addRecipeSteps)
    .map((plan) => addSchedule(plan, request));
}

function buildGenerateResponse(request) {
  if (curatedData.dishes && curatedData.dishes.length >= 100) {
    return {
      plans: buildCuratedPlans(request),
      daily_recommended: getDailyRecommended(),
      daily_not_recommended: getDailyNotRecommended()
    };
  }

  return {
    plans: getMockPlans(request),
    daily_recommended: DAILY_RECOMMENDED,
    daily_not_recommended: DAILY_NOT_RECOMMENDED
  };
}

function uniqueKnownNames(names) {
  return Array.from(new Set(names)).filter(Boolean);
}

function getDailyRecommended(month = currentMonth(), day = currentDay()) {
  const seasonalPriority = weeklySeasonalNames(month, day);
  const staples = ["鸡蛋", "豆腐", "鸡腿"];
  const cheap = curatedData.priceBaseline
    .filter((item) => item.current_price <= item.cheap_threshold)
    .map((item) => item.name);
  const seasonal = curatedData.ingredients
    .filter((item) => item.season_months.includes(month))
    .map((item) => item.standard_name);
  const nutrition = curatedData.nutrition
    .filter((item) => (item.tags || []).some((tag) => ["高蛋白", "高纤维", "清淡汤水"].includes(tag)))
    .map((item) => item.name);
  const priority = new Map();
  seasonalPriority.forEach((name, index) => priority.set(name, 120 - index * 4));
  GREENHOUSE_BACKUPS.forEach((name, index) => priority.set(name, Math.max(priority.get(name) || 0, 70 - index * 2)));
  cheap.forEach((name) => priority.set(name, (priority.get(name) || 0) + 18));
  staples.forEach((name) => priority.set(name, Math.max(priority.get(name) || 0, 55)));
  seasonal.forEach((name) => priority.set(name, (priority.get(name) || 0) + 6));
  nutrition.forEach((name) => priority.set(name, (priority.get(name) || 0) + 4));

  return uniqueKnownNames(seasonalPriority.concat(GREENHOUSE_BACKUPS, cheap, staples, seasonal, nutrition))
    .filter((name) => getPriceTier(name) !== "很贵")
    .sort((a, b) => (priority.get(b) || 0) + priceScore(b) - ((priority.get(a) || 0) + priceScore(a)))
    .slice(0, 8);
}

function getDailyNotRecommended() {
  const recommended = new Set(getDailyRecommended());
  const expensive = curatedData.priceBaseline
    .filter((item) => getPriceTier(item.name) === "很贵" || getPriceTier(item.name) === "偏贵")
    .filter((item) => !recommended.has(item.name))
    .slice(0, 4)
    .map((item) => ({
      name: item.name,
      reason:
        getPriceTier(item.name) === "很贵"
          ? "今天价格明显高于本地基线，非刚需可先跳过"
          : "今天价格偏贵，想吃可以保留，预算紧时换同类食材"
    }));
  if (!expensive.some((item) => item.name === "排骨")) {
    expensive.unshift({
      name: "排骨",
      reason: "价格和烹饪时间都容易超预算，工作日可换鸡腿或肉末"
    });
  }
  return expensive.slice(0, 4);
}

const ingredientCategory = new Map(
  curatedData.ingredients.map((item) => [item.standard_name, item.category])
);

const costScore = {
  低: 12,
  中: 22,
  高: 36
};

const FAVORITE_RECOMMEND_PERCENT = 50;

const priceByName = new Map(curatedData.priceBaseline.map((item) => [item.name, item]));

function getPriceTier(name) {
  const row = priceByName.get(name);
  if (!row) return "正常";
  if (row.current_price <= row.cheap_threshold) return "便宜";
  if (row.current_price < row.expensive_threshold) return "正常";
  if (row.current_price < row.expensive_threshold * 1.2) return "偏贵";
  return "很贵";
}

function priceScore(name) {
  const tier = getPriceTier(name);
  if (tier === "便宜") return 12;
  if (tier === "正常") return 4;
  if (tier === "偏贵") return -6;
  return -40;
}

function currentDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function recommendationDateKey(request) {
  return /^\d{4}-\d{2}-\d{2}$/.test(request.recommendation_date || "")
    ? request.recommendation_date
    : currentDateKey();
}

function hashText(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeFavoriteFoods(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean).map((item) => item.slice(0, 24)))).slice(0, 12);
}

function matchesFavoriteFood(dish, favorite) {
  return (
    dish.dish_name.includes(favorite) ||
    dish.main_ingredients.some((ingredient) => ingredient === favorite || ingredient.includes(favorite))
  );
}

function favoritePick(request) {
  const favorites = normalizeFavoriteFoods(request.favorite_foods);
  if (!favorites.length) return null;

  const baseSeed = `${recommendationDateKey(request)}|${request.user_id || ""}|${favorites.join("|")}`;
  if (hashText(baseSeed) % 100 >= FAVORITE_RECOMMEND_PERCENT) return null;

  const start = hashText(`${baseSeed}|favorite`) % favorites.length;
  const orderedFavorites = favorites.slice(start).concat(favorites.slice(0, start));
  for (const favorite of orderedFavorites) {
    const candidates = curatedData.dishes
      .filter((dish) => matchesFavoriteFood(dish, favorite))
      .filter((dish) => !blockedByRequest(dish, request))
      .sort((a, b) => scoreDish(b, request, "营养均衡型") - scoreDish(a, request, "营养均衡型"));

    if (candidates.length) {
      return {
        favorite,
        dish: candidates[hashText(`${baseSeed}|${favorite}|dish`) % candidates.length]
      };
    }
  }

  return null;
}

function withFavoriteReason(reason) {
  return reason.includes("喜欢") ? reason : `今天抽中你的喜欢 · ${reason}`;
}

function withDailyFavorite(plans, request) {
  const pick = favoritePick(request);
  if (!pick) return plans;

  const existingPlanIndex = plans.findIndex((plan) =>
    plan.dishes.some((dish) => {
      const seedDish = curatedData.dishes.find((item) => item.dish_name === dish.name);
      return seedDish ? matchesFavoriteFood(seedDish, pick.favorite) : dish.name.includes(pick.favorite);
    })
  );

  if (existingPlanIndex >= 0) {
    return plans.map((plan, planIndex) => planIndex === existingPlanIndex
      ? {
          ...plan,
          dishes: plan.dishes.map((dish) => {
            const seedDish = curatedData.dishes.find((item) => item.dish_name === dish.name);
            return (seedDish && matchesFavoriteFood(seedDish, pick.favorite)) || dish.name.includes(pick.favorite)
              ? { ...dish, reason: withFavoriteReason(dish.reason) }
              : dish;
          })
        }
      : plan);
  }

  const targetPlan = plans[0];
  if (!targetPlan) return plans;
  const replacementIndex = targetPlan.dishes.findIndex((dish) => dish.category === pick.dish.category);
  const dishIndex = replacementIndex >= 0 ? replacementIndex : targetPlan.dishes.length - 1;
  const favoriteDish = {
    name: pick.dish.dish_name,
    category: pick.dish.category,
    reason: withFavoriteReason(`${pick.dish.cuisine} · ${pick.dish.time_minutes} 分钟 · ${pick.dish.taste.join("/")}`),
    ingredients: pick.dish.shopping_amount_for_3_people,
    steps: buildCoachSteps(pick.dish, request),
    tips: buildCoachTips(pick.dish, request)
  };
  const nextDishes = targetPlan.dishes.slice();
  nextDishes[dishIndex] = favoriteDish;
  const selectedSeedDishes = nextDishes
    .map((dish) => curatedData.dishes.find((seed) => seed.dish_name === dish.name))
    .filter(Boolean);
  const nextPlan = {
    ...targetPlan,
    title: nextDishes.map((dish) => dish.name).slice(0, 2).join(" + "),
    dishes: nextDishes,
    shopping_list: curatedShoppingList(selectedSeedDishes),
    cooking_order: [
      "先洗米煮饭，顺手把汤锅或蒸锅准备好",
      ...selectedSeedDishes
        .slice()
        .sort((a, b) => b.time_minutes - a.time_minutes)
        .map((dish) => `${dish.dish_name}：${dish.steps[0]}`),
      "最后集中炒青菜、调味收尾，上桌前尝咸淡"
    ]
  };

  return plans.map((plan, index) => (index === 0 ? addSchedule(nextPlan, request) : plan));
}

function dishPriceScore(dish, type) {
  return dish.main_ingredients.reduce((score, name) => {
    const tier = getPriceTier(name);
    if (tier === "便宜") return score + (type === "省钱快手型" ? 2 : 1);
    if (tier === "偏贵") return score - (type === "省钱快手型" ? 3 : type === "改善伙食型" ? 1 : 2);
    if (tier === "很贵") return score - (type === "改善伙食型" ? 5 : 8);
    return score;
  }, 0);
}

function blockedByRequest(dish, request) {
  const text = [...(dish.avoid_tags || []), ...dish.main_ingredients, dish.dish_name].join(" ");
  return (request.avoid || []).some((tag) => text.includes(tag));
}

function scoreDish(dish, request, type) {
  let score = 0;
  const seasonalNames = new Set(MONTHLY_SEASON[currentMonth()] || []);
  if (dish.time_minutes <= request.time_limit) score += 3;
  if (dish.estimated_cost_level === "低") score += type === "省钱快手型" ? 4 : 1;
  if (dish.estimated_cost_level === "中") score += type === "营养均衡型" ? 2 : 1;
  if (request.has_child && dish.kid_friendly) score += type === "孩子老人友好型" ? 5 : 2;
  if (request.has_elder && dish.elder_friendly) score += type === "孩子老人友好型" ? 5 : 2;
  if ((request.taste || []).some((taste) => dish.taste.includes(taste))) score += 2;
  if (dish.cuisine === "广东家常") score += 1;
  if ((dish.season || []).includes(currentMonth())) score += 1;
  if (dish.main_ingredients.some((name) => seasonalNames.has(name))) score += 4;
  score += dishPriceScore(dish, type);
  if (type === "改善伙食型" && dish.estimated_cost_level !== "低") score += 2;
  return score;
}

function pickCuratedDish(pool, request, type, categories, used) {
  const variant = Math.max(0, Math.floor(request.variant || 0));
  const candidates = pool
    .filter((dish) => categories.includes(dish.category))
    .filter((dish) => !used.has(dish.dish_name))
    .filter((dish) => !blockedByRequest(dish, request))
    .sort((a, b) => scoreDish(b, request, type) - scoreDish(a, request, type));
  const selected =
    candidates[(variant + used.size) % Math.max(1, candidates.length)] ||
    pool.find((dish) => !used.has(dish.dish_name)) ||
    pool[0];
  used.add(selected.dish_name);
  return selected;
}

function buildCoachGoal(dish, request) {
  const method = (dish.cooking_methods && dish.cooking_methods[0]) || dish.category;
  const taste = dish.taste[0] || "家常";
  const friendlyNote = request.has_child || request.has_elder
    ? "口感尽量软一点、味道淡一点"
    : "保留食材本味，不要把火候做老";
  return `目标是：${dish.dish_name}做出来要${taste}、不腻，${method}的时候重点看火候，${friendlyNote}。`;
}

function buildPrepStep(dish, request) {
  const ingredients = dish.main_ingredients.slice(0, 3);
  const hasEgg = ingredients.includes("鸡蛋");
  const hasMeatMince = ingredients.includes("猪肉末");
  const hasFish = ingredients.some((item) => item.includes("鱼"));
  const mainWithoutEgg = ingredients.filter((item) => item !== "鸡蛋").join("、");
  const beginnerPrefix = request.cook_speed === "beginner" ? "开火前先把调料、盘子和锅具都放顺手。" : "";

  if (dish.dish_name.includes("蒸蛋") || (hasEgg && hasMeatMince)) {
    return `${beginnerPrefix}鸡蛋打散后加约 1.5 倍温水，肉末用少许盐和生抽抓匀；蛋液过筛会更嫩，别直接大火硬蒸。`;
  }

  if (dish.category === "蛋类" && hasEgg) {
    return `${beginnerPrefix}鸡蛋先打散，${mainWithoutEgg || "配菜"}洗净处理好；下锅前把盐和生抽放在手边，别炒到一半才找调料。`;
  }

  if (hasFish) {
    return `${beginnerPrefix}${ingredients.join("、")}处理干净，鱼肚黑膜和血水要冲掉；盘底垫姜葱，腥味会轻很多。`;
  }

  if (dish.category === "素菜") {
    return `${beginnerPrefix}${ingredients.join("、")}洗净沥干，菜梗和菜叶尽量分开；水太多会变成煮菜，别湿着下锅。`;
  }

  return `${beginnerPrefix}${ingredients.join("、")}提前处理好，容易熟的和耐煮的分开放；肉类可以先用少许盐、淀粉和油抓匀。`;
}

function buildMethodStep(dish) {
  const method = (dish.cooking_methods && dish.cooking_methods[0]) || "";

  if (dish.dish_name.includes("蒸蛋")) {
    return "水开后转中小火再上锅，碗口盖盘子防止水滴进去；看到表面凝固、轻轻晃动像嫩豆腐，就可以关火焖 1-2 分钟。";
  }

  if (method === "蒸" && dish.main_ingredients.some((item) => item.includes("鱼"))) {
    return "蒸锅一定等水开再上鱼，中大火保持蒸汽；看到鱼眼发白、鱼肉能被筷子轻轻拨开就熟了，不要久蒸。";
  }

  if (method === "蒸") {
    return "蒸锅一定等水开再上菜，中火保持有蒸汽；看到肉色变白、筷子能轻松戳进主料就接近熟了，不要反复掀盖。";
  }

  if (method === "炒") {
    if (dish.category === "素菜") {
      return "锅热后再倒油，先下蒜末炒香，再放菜梗，最后放菜叶；看到菜色变亮、边缘变软就说明快好了，别一直炒到出水。";
    }

    return "锅热后再倒油，先下蒜姜或肉类打底，再放蔬菜；看到菜色变亮、边缘变软就说明快好了，别一直炒到出水。";
  }

  if (method === "煮" || method === "炖") {
    return "先下耐煮食材煮出底味，再下易熟食材；看到汤面小滚、食材能被筷子轻松戳进，就可以准备调味。";
  }

  if (method === "焖" || method === "烧") {
    return "先把主料炒到表面变色再加水，水量到食材一半到八分高；如果锅底快干就补少量热水，不要一次加太多。";
  }

  if (method === "煎") {
    return "锅和油都热了再下锅，先别急着翻面；看到边缘定型、底面金黄再翻，鱼肉和豆腐才不容易碎。";
  }

  if (method === "焯") {
    return "水开后加一点盐和油再下菜；看到颜色变翠、梗部略软就捞出，不要久煮。";
  }

  return "按从难熟到易熟的顺序下锅；看到食材颜色和质地明显变化，再进入调味收尾。";
}

function buildCoachSteps(dish, request) {
  const hasBones = dish.main_ingredients.some((item) => /鱼|排骨|鸡腿|鸡翅|鸭肉|带鱼|鸡肉/.test(item));
  const finish = request.has_child || request.has_elder
    ? hasBones
      ? "出锅前先尝味道，盐少量多次加；给孩子和老人吃的部分，可以剪小块、挑掉骨刺，再单独盛出来。"
      : "出锅前先尝味道，盐少量多次加；给孩子和老人吃的部分，可以剪小块或多焖一会儿，再单独盛出来。"
    : "出锅前尝一下咸淡，宁可淡一点，最后用生抽或盐微调；不要为了颜色好看把菜继续加热太久。";

  return [buildCoachGoal(dish, request), buildPrepStep(dish, request), buildMethodStep(dish), finish];
}

function buildCoachTips(dish, request) {
  const method = (dish.cooking_methods && dish.cooking_methods[0]) || "";
  const hasBones = dish.main_ingredients.some((item) => /鱼|排骨|鸡腿|鸡翅|鸭肉|带鱼|鸡肉/.test(item));
  const tips = [
    `关键点：${method === "炒" ? "大火快炒、断生就出锅" : method === "蒸" ? "水开上锅、少开盖" : method === "煮" || method === "炖" ? "先耐煮后易熟，最后再调味" : "先判断熟度，再调味收尾"}。`
  ];

  if (request.has_child && dish.kid_friendly) {
    tips.push("孩子版：少盐少酱油，肉和菜切小一点，入口更稳。");
  }

  if (request.has_elder && dish.elder_friendly) {
    tips.push(
      hasBones
        ? "老人版：多留 2-3 分钟让食材软一点，鱼和骨头类先检查骨刺。"
        : "老人版：多留 1-2 分钟让食材软一点，少油少盐更稳。"
    );
  }

  if (request.cook_speed === "beginner") {
    tips.push("新手提醒：开火前把菜、碗、调料都摆好，先慢后稳，比边做边找更快。");
  }

  const substituteIngredient = dish.main_ingredients.find((item) => !["鸡蛋", "姜", "葱", "蒜"].includes(item)) || dish.main_ingredients[0];
  if (substituteIngredient) {
    tips.push(`替换思路：买不到${substituteIngredient}时，优先换同类食材，做法和调味不用大改。`);
  }

  return tips;
}

function curatedShoppingList(selected) {
  const groups = new Map();
  for (const dish of selected) {
    for (const item of dish.shopping_amount_for_3_people || []) {
      const category = ingredientCategory.get(item.name) || "其他";
      const list = groups.get(category) || [];
      if (!list.some((existing) => existing.name === item.name)) {
        list.push({ name: item.name, amount: item.amount });
      }
      groups.set(category, list);
    }
  }
  return Array.from(groups, ([category, items]) => ({ category, items }));
}

function buildCuratedPlan(request, type, used) {
  const pool = type === "孩子老人友好型"
    ? curatedData.dishes.filter((dish) => dish.kid_friendly && dish.elder_friendly)
    : curatedData.dishes;
  const selected = [
    pickCuratedDish(pool, request, type, ["荤菜", "蛋类", "豆腐"], used),
    pickCuratedDish(pool, request, type, ["素菜"], used),
    pickCuratedDish(pool, request, type, ["汤"], used),
    pickCuratedDish(pool, request, type, ["蛋类", "豆腐", "主食", "蒸菜", "荤菜"], used)
  ];
  const plan = {
    type,
    title: selected.map((dish) => dish.dish_name).slice(0, 2).join(" + "),
    estimated_cost: Math.min(
      Math.max(selected.reduce((sum, dish) => sum + (costScore[dish.estimated_cost_level] || 18), 0), 45),
      request.budget + 25
    ),
    total_time: Math.min(
      Math.max(...selected.map((dish) => dish.time_minutes)) + 12,
      request.time_limit + (request.cook_speed === "beginner" ? 20 : request.cook_speed === "slow" ? 10 : 0)
    ),
    dishes: selected.map((dish) => ({
      name: dish.dish_name,
      category: dish.category,
      reason: `${dish.cuisine} · ${dish.time_minutes} 分钟 · ${dish.taste.join("/")}`,
      ingredients: dish.shopping_amount_for_3_people,
      steps: buildCoachSteps(dish, request),
      tips: buildCoachTips(dish, request)
    })),
    shopping_list: curatedShoppingList(selected),
    cooking_order: [
      "先洗米煮饭，顺手把汤锅或蒸锅准备好",
      ...selected
        .slice()
        .sort((a, b) => b.time_minutes - a.time_minutes)
        .map((dish) => `${dish.dish_name}：${dish.steps[0]}`),
      "最后集中炒青菜、调味收尾，上桌前尝咸淡"
    ],
    reason: type === "省钱快手型"
      ? "优先选择低成本、短时间、家庭接受度高的菜。"
      : type === "营养均衡型"
        ? "按蛋白质、蔬菜和汤水组合，兼顾深圳家庭常见口味。"
        : type === "孩子老人友好型"
          ? "避开重辣和难嚼菜，优先蒸煮、清淡、软嫩的做法。"
          : "加入更有满足感的荤菜和下饭菜。"
  };
  return addSchedule(plan, request);
}

function buildCuratedPlans(request) {
  const used = new Set();
  const thirdType = request.has_child || request.has_elder ? "孩子老人友好型" : "改善伙食型";
  return withDailyFavorite([
    buildCuratedPlan(request, "省钱快手型", used),
    buildCuratedPlan(request, "营养均衡型", used),
    buildCuratedPlan(request, thirdType, used)
  ], request);
}

module.exports = {
  buildGenerateResponse
};
