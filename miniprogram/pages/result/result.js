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

Page({
  data: {
    form: null,
    request: null,
    dailyRecommended: [],
    dailyNotRecommended: [],
    plans: []
  },

  onLoad(options) {
    const form = parseForm(options);
    const prefixedUserId = buildPrefixedUserId(form.userId);
    const request = buildRequest(form);
    const response = buildGenerateResponse(request);
    if (prefixedUserId) {
      wx.setStorageSync(USER_ID_KEY, prefixedUserId);
    }
    wx.setStorageSync(LAST_FORM_KEY, form);
    this.setData({
      form,
      request,
      dailyRecommended: response.daily_recommended.join("、"),
      dailyNotRecommended: response.daily_not_recommended,
      plans: response.plans
    });
  },

  rememberPlan(event) {
    const index = Number(event.currentTarget.dataset.index);
    const plan = this.data.plans[index];
    wx.setStorageSync(LAST_CHOICE_KEY, {
      planIndex: index,
      planTitle: plan.title,
      planType: plan.type,
      resultUrl: buildResultUrl(this.data.form),
      form: this.data.form,
      savedAt: new Date().toISOString()
    });
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
