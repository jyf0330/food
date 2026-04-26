const LAST_FORM_KEY = "san-zhuo-cai:last-form";
const LAST_CHOICE_KEY = "san-zhuo-cai:last-choice";
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

function normalizeFoodName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_-]/g, "")
    .slice(0, 24);
}

const DEFAULT_FORM = {
  people: 3,
  family: "child",
  budget: 80,
  time: 40,
  taste: ["清淡", "不辣"],
  channel: "菜市场",
  avoid: [],
  finishTime: "12:00",
  cookSpeed: "slow",
  userId: "",
  favoriteFoods: []
};

function normalizeStoredForm(form) {
  return {
    ...DEFAULT_FORM,
    ...(form || {}),
    favoriteFoods: Array.isArray(form && form.favoriteFoods) ? form.favoriteFoods : []
  };
}

const choices = {
  people: [
    { id: 1, label: "1人" },
    { id: 2, label: "2人" },
    { id: 3, label: "3人" },
    { id: 4, label: "4人" },
    { id: 5, label: "5人+" }
  ],
  family: [
    { id: "none", label: "没有" },
    { id: "child", label: "有小孩" },
    { id: "elder", label: "有老人" },
    { id: "both", label: "都有" }
  ],
  budget: [
    { id: 50, label: "50以内" },
    { id: 80, label: "50-80" },
    { id: 120, label: "80-120" },
    { id: 200, label: "120+" }
  ],
  time: [
    { id: 20, label: "20分钟" },
    { id: 30, label: "30分钟" },
    { id: 40, label: "40分钟" },
    { id: 60, label: "1小时" }
  ],
  finishTime: [
    { id: "12:00", label: "12:00" },
    { id: "18:30", label: "18:30" },
    { id: "19:00", label: "19:00" },
    { id: "20:00", label: "20:00" }
  ],
  cookSpeed: [
    { id: "normal", label: "正常" },
    { id: "slow", label: "慢一点" },
    { id: "beginner", label: "新手慢做" }
  ],
  taste: [
    { id: "清淡", label: "清淡" },
    { id: "家常", label: "家常" },
    { id: "重口", label: "重口" },
    { id: "不辣", label: "不辣" },
    { id: "微辣", label: "微辣" }
  ],
  avoid: [
    { id: "辣", label: "辣" },
    { id: "鱼", label: "鱼" },
    { id: "牛羊肉", label: "牛羊肉" },
    { id: "海鲜", label: "海鲜" },
    { id: "香菜", label: "香菜" },
    { id: "内脏", label: "内脏" }
  ]
};

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
    ["favoriteFoods", (form.favoriteFoods || []).join(",")]
  ];
  const userId = getUserIdDisplay(form.userId);
  if (userId) {
    params.push(["userId", userId]);
  }
  if (form.variant) {
    params.push(["variant", form.variant]);
  }
  return `/pages/result/result?${params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;
}

Page({
  data: {
    ...choices,
    tasteOptions: [],
    avoidOptions: [],
    advancedOpen: false,
    favoriteFoodInput: "",
    form: DEFAULT_FORM,
    lastForm: null,
    lastChoice: null
  },

  onLoad() {
    const savedUserId = getUserIdDisplay(wx.getStorageSync(USER_ID_KEY));
    const form = { ...DEFAULT_FORM, userId: savedUserId };
    this.setData({ form });
    this.syncMultiOptions(form);
    this.loadMemory();
  },

  onShow() {
    this.loadMemory();
  },

  loadMemory() {
    this.setData({
      lastForm: wx.getStorageSync(LAST_FORM_KEY) || null,
      lastChoice: wx.getStorageSync(LAST_CHOICE_KEY) || null
    });
  },

  selectOne(event) {
    const { field, value } = event.currentTarget.dataset;
    const parsed = ["people", "budget", "time"].includes(field) ? Number(value) : value;
    this.setData({ [`form.${field}`]: parsed });
  },

  toggleMulti(event) {
    const { field, value } = event.currentTarget.dataset;
    const current = this.data.form[field] || [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : current.concat(value);
    this.setData({ [`form.${field}`]: next });
    this.syncMultiOptions({ ...this.data.form, [field]: next });
  },

  updateUserId(event) {
    const userId = getUserIdDisplay(event.detail.value);
    this.setData({ "form.userId": userId });
  },

  applyLastForm() {
    if (this.data.lastForm) {
      const form = normalizeStoredForm(this.data.lastForm);
      this.setData({ form });
      if (form.favoriteFoods.length) {
        this.setData({ advancedOpen: true });
      }
      this.syncMultiOptions(form);
    }
  },

  useLastForm() {
    if (this.data.lastForm) {
      this.goResult(normalizeStoredForm(this.data.lastForm));
    }
  },

  useLastChoice() {
    const choice = this.data.lastChoice;
    if (choice && choice.resultUrl) {
      wx.navigateTo({ url: choice.resultUrl });
    }
  },

  editLastChoice() {
    const choice = this.data.lastChoice;
    if (choice && choice.form) {
      const form = normalizeStoredForm(choice.form);
      this.setData({ form });
      if (form.favoriteFoods.length) {
        this.setData({ advancedOpen: true });
      }
      this.syncMultiOptions(form);
    }
  },

  toggleAdvanced() {
    this.setData({ advancedOpen: !this.data.advancedOpen });
  },

  updateFavoriteFoodInput(event) {
    this.setData({ favoriteFoodInput: event.detail.value });
  },

  addFavoriteFood() {
    const food = normalizeFoodName(this.data.favoriteFoodInput);
    if (!food) return;
    const current = this.data.form.favoriteFoods || [];
    const next = current.includes(food) ? current : current.concat(food).slice(0, 12);
    this.setData({
      "form.favoriteFoods": next,
      favoriteFoodInput: ""
    });
  },

  removeFavoriteFood(event) {
    const { value } = event.currentTarget.dataset;
    const next = (this.data.form.favoriteFoods || []).filter((item) => item !== value);
    this.setData({ "form.favoriteFoods": next });
  },

  submit() {
    this.goResult(this.data.form);
  },

  goResult(form) {
    const prefixedUserId = buildPrefixedUserId(form.userId);
    if (prefixedUserId) {
      wx.setStorageSync(USER_ID_KEY, prefixedUserId);
    }
    wx.setStorageSync(LAST_FORM_KEY, form);
    wx.navigateTo({ url: buildResultUrl({ ...form, channel: DEFAULT_FORM.channel }) });
  },

  syncMultiOptions(form) {
    this.setData({
      tasteOptions: choices.taste.map((item) => ({
        ...item,
        active: (form.taste || []).includes(item.id)
      })),
      avoidOptions: choices.avoid.map((item) => ({
        ...item,
        active: (form.avoid || []).includes(item.id)
      }))
    });
  }
});
