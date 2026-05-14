const {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_POOL,
  homeDishesFromNames,
  normalizeHomeDishNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes
} = require("../../utils/homeDishes");

const LAST_FORM_KEY = "san-zhuo-cai:last-form";
const LAST_CHOICE_KEY = "san-zhuo-cai:last-choice";
const SELECTED_DISHES_KEY = "san-zhuo-cai:home-selected-dishes";
const VISIBLE_DISHES_KEY = "san-zhuo-cai:home-visible-dishes";
const SAVED_DISHES_KEY = "san-zhuo-cai:home-saved-dishes";
const HOME_DISH_COUNT = 12;

const DEFAULT_FORM = {
  people: 3,
  family: "child",
  budget: 80,
  time: 40,
  taste: ["清淡", "不辣"],
  channel: "菜市场",
  avoid: [],
  finishTime: "18:30",
  cookSpeed: "slow",
  favoriteFoods: []
};

function nextResultVariant() {
  return Math.max(1, Date.now() + Math.floor(Math.random() * 1000000));
}

function readJsonList(key, fallback, options = {}) {
  try {
    return normalizeHomeDishNames(wx.getStorageSync(key), fallback, {
      ...options,
      limit: HOME_DISH_COUNT
    });
  } catch {
    return fallback;
  }
}

function writeJsonList(key, value) {
  wx.setStorageSync(key, value);
}

function buildResultUrl(form, selectedDishes) {
  const params = [
    ["selectedDishes", selectedDishes.join(",")],
    ["people", form.people],
    ["family", form.family],
    ["budget", form.budget],
    ["time", form.time],
    ["taste", form.taste.join(",")],
    ["channel", form.channel],
    ["avoid", form.avoid.join(",")],
    ["finishTime", form.finishTime],
    ["cookSpeed", form.cookSpeed],
    ["favoriteFoods", selectedDishes.join(",")],
    ["variant", nextResultVariant()]
  ];

  return `/pages/result/result?${params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;
}

Page({
  data: {
    visibleDishNames: DEFAULT_HOME_DISH_NAMES,
    selectedDishes: DEFAULT_HOME_DISH_NAMES.slice(0, 4),
    savedDishes: [],
    dishes: [],
    filter: "all",
    searchOpen: false,
    searchQuery: "",
    selectedCount: 4,
    selectedSummary: DEFAULT_HOME_DISH_NAMES.slice(0, 2).join("、"),
    selectedMoreCount: 2,
    canSubmit: true,
    dishCountLabel: "",
    submitTitle: "已选 4 道",
    submitDesc: `${DEFAULT_HOME_DISH_NAMES.slice(0, 2).join("、")} 等 4 道`,
    emptyTitle: "没找到这道菜",
    emptyDesc: "换个菜名、分类或口味试试，比如“汤”“快手”“番茄”。",
    lastChoiceTitle: "",
    lastChoice: null
  },

  onLoad() {
    const visibleDishNames = readJsonList(VISIBLE_DISHES_KEY, DEFAULT_HOME_DISH_NAMES);
    const selectedDishes = readJsonList(
      SELECTED_DISHES_KEY,
      DEFAULT_HOME_DISH_NAMES.slice(0, 4),
      { allowEmpty: true }
    );
    const savedDishes = readJsonList(SAVED_DISHES_KEY, [], { allowEmpty: true });
    this.setData({
      visibleDishNames,
      selectedDishes,
      savedDishes,
      ...this.buildLastChoiceState(wx.getStorageSync(LAST_CHOICE_KEY) || null)
    });
    this.renderDishes();
  },

  onShow() {
    this.setData(this.buildLastChoiceState(wx.getStorageSync(LAST_CHOICE_KEY) || null));
  },

  buildLastChoiceState(lastChoice) {
    return {
      lastChoice,
      lastChoiceTitle: lastChoice ? lastChoice.planTitle || lastChoice.planType || "" : ""
    };
  },

  renderDishes() {
    const query = this.data.searchQuery.trim();
    const source = query ? HOME_DISH_POOL : homeDishesFromNames(this.data.visibleDishNames);
    const filteredByCollection =
      this.data.filter === "saved"
        ? source.filter((dish) => this.data.savedDishes.includes(dish.name))
        : source;
    const dishes = searchHomeDishes(filteredByCollection, query).map((dish) => ({
      ...dish,
      selected: this.data.selectedDishes.includes(dish.name),
      saved: this.data.savedDishes.includes(dish.name)
    }));
    const selectedSummary = this.data.selectedDishes.slice(0, 2).join("、");
    const selectedCount = this.data.selectedDishes.length;
    const selectedMoreCount = Math.max(0, selectedCount - 2);

    this.setData({
      dishes,
      selectedCount,
      selectedSummary,
      selectedMoreCount,
      canSubmit: selectedCount > 0,
      dishCountLabel: query
        ? `${this.data.filter === "saved" ? "收藏里" : "全部菜库"}找到 ${dishes.length} 道`
        : "",
      submitTitle: selectedCount ? `已选 ${selectedCount} 道` : "先选一道菜",
      submitDesc: selectedCount
        ? `${selectedSummary}${selectedMoreCount ? ` 等 ${selectedCount} 道` : ""}`
        : "点菜名就能加入菜单",
      emptyTitle: this.data.filter === "saved" ? "还没有收藏" : "没找到这道菜",
      emptyDesc: this.data.filter === "saved"
        ? "看到常吃的菜，点收藏，下次会在这里出现。"
        : "换个菜名、分类或口味试试，比如“汤”“快手”“番茄”。"
    });
  },

  setFilter(event) {
    this.setData({ filter: event.currentTarget.dataset.filter });
    this.renderDishes();
  },

  showAllDishes() {
    this.setData({ filter: "all", searchQuery: "" });
    this.renderDishes();
  },

  toggleSearch() {
    this.setData({
      searchOpen: !this.data.searchOpen,
      searchQuery: this.data.searchOpen ? "" : this.data.searchQuery
    });
    this.renderDishes();
  },

  updateSearch(event) {
    this.setData({ searchQuery: event.detail.value });
    this.renderDishes();
  },

  clearSearch() {
    this.setData({ searchQuery: "" });
    this.renderDishes();
  },

  refreshDishes() {
    const visibleDishNames = refreshUnselectedHomeDishes(
      this.data.visibleDishNames,
      this.data.selectedDishes,
      Date.now()
    );
    writeJsonList(VISIBLE_DISHES_KEY, visibleDishNames);
    this.setData({ visibleDishNames });
    this.renderDishes();
  },

  toggleDish(event) {
    const name = event.currentTarget.dataset.name;
    const selectedDishes = this.data.selectedDishes.includes(name)
      ? this.data.selectedDishes.filter((item) => item !== name)
      : this.data.selectedDishes.concat(name).slice(0, HOME_DISH_COUNT);
    writeJsonList(SELECTED_DISHES_KEY, selectedDishes);
    this.setData({ selectedDishes });
    this.renderDishes();
  },

  toggleSaved(event) {
    const name = event.currentTarget.dataset.name;
    const savedDishes = this.data.savedDishes.includes(name)
      ? this.data.savedDishes.filter((item) => item !== name)
      : this.data.savedDishes.concat(name);
    writeJsonList(SAVED_DISHES_KEY, savedDishes);
    this.setData({ savedDishes });
    this.renderDishes();
  },

  useLastChoice() {
    const choice = this.data.lastChoice;
    if (choice && choice.resultUrl) {
      wx.navigateTo({ url: choice.resultUrl });
    }
  },

  generateRecipe() {
    if (!this.data.selectedDishes.length) {
      wx.showToast({ title: "先选一道菜", icon: "none" });
      return;
    }
    const form = {
      ...DEFAULT_FORM,
      favoriteFoods: this.data.selectedDishes
    };
    wx.setStorageSync(LAST_FORM_KEY, form);
    wx.navigateTo({ url: buildResultUrl(form, this.data.selectedDishes) });
  }
});
