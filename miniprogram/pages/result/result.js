const { buildGenerateResponse } = require("../../utils/mealPlans");

const LAST_CHOICE_KEY = "san-zhuo-cai:last-choice";
const LAST_FORM_KEY = "san-zhuo-cai:last-form";
const USER_ID_KEY = "jtcsm:user-id";
const USER_ID_PREFIX = "jtcsm_";

function getUserIdDisplay(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  const withoutPrefix = trimmed.startsWith(USER_ID_PREFIX)
    ? trimmed.slice(USER_ID_PREFIX.length)
    : trimmed;
  return withoutPrefix
    .replace(/\s+/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_-]/g, "")
    .slice(0, 32);
}

function buildPrefixedUserId(value) {
  const display = getUserIdDisplay(value);
  return display ? `${USER_ID_PREFIX}${display}` : "";
}

function splitList(value) {
  return value ? decodeURIComponent(value).split(",").filter(Boolean) : [];
}

function parseForm(options) {
  return {
    people: Number(options.people) || 3,
    family: options.family || "none",
    budget: Number(options.budget) || 80,
    time: Number(options.time) || 40,
    taste: splitList(options.taste),
    channel: options.channel ? decodeURIComponent(options.channel) : "菜市场",
    avoid: splitList(options.avoid),
    favoriteFoods: splitList(options.favoriteFoods),
    finishTime: options.finishTime ? decodeURIComponent(options.finishTime) : "12:00",
    cookSpeed: options.cookSpeed || "normal",
    variant: Math.max(0, Number(options.variant) || 0),
    userId: options.userId ? getUserIdDisplay(decodeURIComponent(options.userId)) : ""
  };
}

function buildRequest(form) {
  return {
    city: "深圳",
    people_count: form.people,
    has_child: form.family === "child" || form.family === "both",
    has_elder: form.family === "elder" || form.family === "both",
    budget: form.budget,
    meal_type: "晚餐",
    taste: form.taste,
    avoid: form.avoid,
    favorite_foods: form.favoriteFoods || [],
    time_limit: form.time,
    finish_time: form.finishTime,
    cook_speed: form.cookSpeed,
    variant: form.variant || 0,
    user_id: buildPrefixedUserId(form.userId),
    shopping_channel: form.channel,
    kitchen_tools: ["炒锅", "电饭锅"]
  };
}

function buildResultUrl(form) {
  const params = [
    ["people", form.people],
    ["family", form.family],
    ["budget", form.budget],
    ["time", form.time],
    ["taste", form.taste.join(",")],
    ["channel", form.channel],
    ["avoid", form.avoid.join(",")],
    ["finishTime", form.finishTime],
    ["cookSpeed", form.cookSpeed],
    ["favoriteFoods", (form.favoriteFoods || []).join(",")],
    ["variant", form.variant || 0]
  ];
  const userId = getUserIdDisplay(form.userId);
  if (userId) {
    params.push(["userId", userId]);
  }
  return `/pages/result/result?${params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;
}

function buildRememberedResultUrl(form, planIndex) {
  const url = buildResultUrl(form);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}planIndex=${encodeURIComponent(planIndex)}`;
}

function withPlanState(plans, currentPlanIndex) {
  return plans.map((plan, index) => ({
    ...plan,
    label: String.fromCharCode(65 + index),
    active: index === currentPlanIndex
  }));
}

function recommendedInitialPlanIndex(plans, budget) {
  if (!plans.length) return 0;
  if (budget >= 150) {
    const upgradeIndex = plans.findIndex((plan) => plan.type === "改善伙食型");
    if (upgradeIndex >= 0) return upgradeIndex;
    return plans.reduce(
      (bestIndex, plan, index) =>
        plan.estimated_cost > plans[bestIndex].estimated_cost ? index : bestIndex,
      0
    );
  }
  if (budget >= 110) {
    const balancedIndex = plans.findIndex((plan) => plan.type === "营养均衡型");
    if (balancedIndex >= 0) return balancedIndex;
  }
  return 0;
}

function initialPlanIndex(plans, budget, selectedPlanIndex) {
  if (
    Number.isInteger(selectedPlanIndex) &&
    selectedPlanIndex >= 0 &&
    selectedPlanIndex < plans.length
  ) {
    return selectedPlanIndex;
  }
  return recommendedInitialPlanIndex(plans, budget);
}

function rememberPlanChoice(form, plan, index) {
  if (!plan) return;
  wx.setStorageSync(LAST_CHOICE_KEY, {
    planIndex: index,
    planTitle: plan.title,
    planType: plan.type,
    resultUrl: buildRememberedResultUrl(form, index),
    form,
    savedAt: new Date().toISOString()
  });
}

Page({
  data: {
    form: null,
    request: null,
    dailyRecommended: [],
    dailyNotRecommended: [],
    currentPlanIndex: 0,
    plans: []
  },

  onLoad(options) {
    const form = parseForm(options);
    const prefixedUserId = buildPrefixedUserId(form.userId);
    const request = buildRequest(form);
    const response = buildGenerateResponse(request);
    const currentPlanIndex = initialPlanIndex(
      response.plans,
      form.budget,
      Number(options.planIndex)
    );
    if (prefixedUserId) {
      wx.setStorageSync(USER_ID_KEY, prefixedUserId);
    }
    wx.setStorageSync(LAST_FORM_KEY, form);
    this.setData({
      form,
      request,
      dailyRecommended: response.daily_recommended.join("、"),
      dailyNotRecommended: response.daily_not_recommended,
      currentPlanIndex,
      plans: withPlanState(response.plans, currentPlanIndex)
    });
  },

  selectPlan(event) {
    const index = Number(event.currentTarget.dataset.index);
    if (!Number.isFinite(index)) return;
    const plan = this.data.plans[index];
    this.setData({
      currentPlanIndex: index,
      plans: withPlanState(this.data.plans, index)
    });
    rememberPlanChoice(this.data.form, plan, index);
  },

  rememberPlan(event) {
    const index = Number(event.currentTarget.dataset.index);
    const plan = this.data.plans[index];
    rememberPlanChoice(this.data.form, plan, index);
    wx.showToast({ title: "已记住", icon: "success" });
  },

  editConditions() {
    wx.setStorageSync(LAST_FORM_KEY, this.data.form);
    wx.navigateBack({
      delta: 1,
      fail: () => wx.redirectTo({ url: "/pages/index/index" })
    });
  },

  swapTable() {
    const nextForm = {
      ...this.data.form,
      variant: (this.data.form.variant || 0) + 1
    };
    wx.setStorageSync(LAST_FORM_KEY, nextForm);
    wx.redirectTo({ url: buildResultUrl(nextForm) });
  }
});
