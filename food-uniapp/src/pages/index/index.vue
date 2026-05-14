<template>
  <view class="phone-page">
    <view class="status-space" />

    <view class="topbar">
      <view>
        <text class="eyebrow">深圳家常晚餐</text>
        <text class="title">今天吃什么</text>
      </view>
      <button class="icon-button" aria-label="清空搜索" @tap="clearSearch">⌕</button>
    </view>

    <view v-if="lastChoice" class="last-choice" @tap="openLastChoice">
      <view>
        <text class="last-label">上次就用这桌</text>
        <text class="last-title">{{ lastChoice.title }}</text>
      </view>
      <text class="last-arrow">›</text>
    </view>

    <view class="toolbar">
      <view class="segmented">
        <button :class="['segment', activeTab === 'all' ? 'active' : '']" @tap="activeTab = 'all'">全部</button>
        <button :class="['segment', activeTab === 'saved' ? 'active' : '']" @tap="activeTab = 'saved'">收藏</button>
      </view>
      <button class="refresh-button" @tap="refreshDishes">刷新</button>
    </view>

    <view class="search-shell">
      <input
        v-model="searchQuery"
        class="search-input"
        confirm-type="search"
        placeholder="搜索菜名、口味、食材"
        placeholder-class="search-placeholder"
      />
    </view>

    <scroll-view class="dish-scroll" scroll-y>
      <view v-if="filteredDishes.length" class="dish-list">
        <view
          v-for="dish in filteredDishes"
          :key="dish.name"
          :class="['dish-row', isSelected(dish.name) ? 'selected' : '']"
          @tap="toggleSelected(dish.name)"
        >
          <view class="select-dot">
            <text>{{ isSelected(dish.name) ? '✓' : '' }}</text>
          </view>
          <view class="dish-main">
            <view class="dish-head">
              <text class="dish-name">{{ dish.name }}</text>
              <text class="dish-time">{{ dish.time }} 分钟</text>
            </view>
            <view class="dish-meta">
              <text>{{ dish.category }}</text>
              <text>{{ dish.note }}</text>
            </view>
          </view>
          <button
            :class="['save-button', isSaved(dish.name) ? 'saved' : '']"
            :aria-label="isSaved(dish.name) ? '取消收藏' : '收藏'"
            @tap.stop="toggleSaved(dish.name)"
          >
            {{ isSaved(dish.name) ? '★' : '☆' }}
          </button>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-title">{{ emptyTitle }}</text>
        <text class="empty-note">{{ emptyNote }}</text>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="selection-copy">
        <text class="selection-title">{{ selectedNames.length ? `已选 ${selectedNames.length} 道` : '先选一道菜' }}</text>
        <text class="selection-note">{{ selectedSummary }}</text>
      </view>
      <button :class="['generate-button', selectedNames.length ? '' : 'disabled']" @tap="generateRecipe">生成</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { navigateTo } from "@/adapters/navigation";
import { readStorage, writeStorage } from "@/adapters/storage";
import {
  DEFAULT_HOME_DISH_NAMES,
  HOME_DISH_COUNT,
  HOME_DISH_POOL,
  dailyHomeDishNames,
  getHomeDishDateKey,
  homeDishesFromNames,
  normalizeHomeDishNames,
  refreshUnselectedHomeDishes,
  searchHomeDishes,
} from "@/domain/homeDishes";
import {
  LAST_CHOICE_KEY,
  LAST_FORM_KEY,
  SAVED_DISHES_KEY,
  SELECTED_DISHES_KEY,
  VISIBLE_DISHES_KEY,
  VISIBLE_DISHES_DATE_KEY,
  type LastChoice,
} from "@/domain/storageKeys";
import { DEFAULT_GENERATE_REQUEST, buildResultPageUrl } from "@/domain/resultUrl";

type TabName = "all" | "saved";

const activeTab = ref<TabName>("all");
const searchQuery = ref("");
const selectedNames = ref<string[]>([]);
const visibleNames = ref<string[]>(DEFAULT_HOME_DISH_NAMES);
const savedNames = ref<string[]>([]);
const lastChoice = ref<LastChoice | null>(null);

function loadState() {
  selectedNames.value = normalizeHomeDishNames(
    readStorage<unknown>(SELECTED_DISHES_KEY, []),
    [],
    { allowEmpty: true, limit: 12 }
  );

  const todayKey = getHomeDishDateKey();
  const storedDateKey = readStorage<string | null>(VISIBLE_DISHES_DATE_KEY, null);
  const dailyNames = dailyHomeDishNames();
  visibleNames.value = normalizeHomeDishNames(
    storedDateKey === todayKey ? readStorage<unknown>(VISIBLE_DISHES_KEY, null) : null,
    dailyNames,
    { limit: HOME_DISH_COUNT }
  );
  writeStorage(VISIBLE_DISHES_KEY, visibleNames.value);
  writeStorage(VISIBLE_DISHES_DATE_KEY, todayKey);

  savedNames.value = normalizeHomeDishNames(
    readStorage<unknown>(SAVED_DISHES_KEY, []),
    [],
    { allowEmpty: true, limit: HOME_DISH_POOL.length }
  );
  lastChoice.value = readStorage<LastChoice | null>(LAST_CHOICE_KEY, null);
}

onLoad(loadState);
onShow(loadState);

const filteredDishes = computed(() => {
  const query = searchQuery.value.trim();
  const source =
    activeTab.value === "saved"
      ? homeDishesFromNames(savedNames.value)
      : query
        ? HOME_DISH_POOL
        : homeDishesFromNames(visibleNames.value);

  return searchHomeDishes(source, query);
});

const emptyTitle = computed(() => (activeTab.value === "saved" ? "还没有收藏" : "没找到这道菜"));
const emptyNote = computed(() =>
  activeTab.value === "saved"
    ? "看到常吃的菜，点收藏，下次会在这里出现。"
    : "换个菜名、分类或口味试试，比如“汤”“快手”“番茄”。"
);
const selectedSummary = computed(() => {
  if (!selectedNames.value.length) return "点选今晚想吃的菜";
  const preview = selectedNames.value.slice(0, 2).join("、");
  const more = selectedNames.value.length > 2 ? `等 ${selectedNames.value.length} 道` : "";
  return `${preview}${more}`;
});

function persistSelected() {
  writeStorage(SELECTED_DISHES_KEY, selectedNames.value);
}

function isSelected(name: string): boolean {
  return selectedNames.value.includes(name);
}

function isSaved(name: string): boolean {
  return savedNames.value.includes(name);
}

function clearSearch() {
  searchQuery.value = "";
}

function toggleSelected(name: string) {
  if (isSelected(name)) {
    selectedNames.value = selectedNames.value.filter((item) => item !== name);
    persistSelected();
    return;
  }

  if (selectedNames.value.length >= 12) {
    uni.showToast({ title: "最多选 12 道", icon: "none" });
    return;
  }

  selectedNames.value = [...selectedNames.value, name];
  persistSelected();
}

function toggleSaved(name: string) {
  savedNames.value = isSaved(name)
    ? savedNames.value.filter((item) => item !== name)
    : [...savedNames.value, name];
  writeStorage(SAVED_DISHES_KEY, savedNames.value);
}

function refreshDishes() {
  visibleNames.value = refreshUnselectedHomeDishes(visibleNames.value, selectedNames.value, Date.now());
  writeStorage(VISIBLE_DISHES_KEY, visibleNames.value);
  writeStorage(VISIBLE_DISHES_DATE_KEY, getHomeDishDateKey());
}

function generateRecipe() {
  if (!selectedNames.value.length) {
    uni.showToast({ title: "先选一道菜", icon: "none" });
    return;
  }

  const request = {
    ...DEFAULT_GENERATE_REQUEST,
    selected_dishes: selectedNames.value,
    favorite_foods: selectedNames.value,
    variant: Date.now(),
  };
  const url = buildResultPageUrl(request);

  writeStorage(LAST_FORM_KEY, request);
  navigateTo(url);
}

function openLastChoice() {
  if (!lastChoice.value?.resultUrl) return;
  navigateTo(lastChoice.value.resultUrl);
}
</script>

<style scoped>
.phone-page {
  position: relative;
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  padding: 0 16px 128px;
  background: #fffaf3;
}

.status-space {
  height: calc(12px + env(safe-area-inset-top));
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 14px;
}

.eyebrow,
.last-label,
.selection-note,
.dish-meta {
  display: block;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

.title {
  display: block;
  margin-top: 2px;
  color: #1f2933;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
}

.icon-button,
.refresh-button,
.save-button {
  min-width: 44px;
  min-height: 44px;
}

.icon-button {
  width: 44px;
  border-radius: 22px;
  background: #ffffff;
  color: #1f8a4c;
  font-size: 24px;
  box-shadow: 0 8px 20px rgba(31, 41, 51, 0.08);
}

.last-choice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid #f0dfc8;
  border-radius: 8px;
  background: #ffffff;
}

.last-title {
  display: block;
  margin-top: 4px;
  color: #1f2933;
  font-size: 16px;
  font-weight: 700;
}

.last-arrow {
  color: #1f8a4c;
  font-size: 28px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.segmented {
  display: flex;
  flex: 1;
  min-height: 44px;
  padding: 4px;
  border: 1px solid #eadac3;
  border-radius: 8px;
  background: #fff3e1;
}

.segment {
  flex: 1;
  min-height: 36px;
  border-radius: 6px;
  color: #6b7280;
  font-size: 15px;
  font-weight: 700;
}

.segment.active {
  background: #ffffff;
  color: #1f2933;
  box-shadow: 0 5px 12px rgba(31, 41, 51, 0.06);
}

.refresh-button {
  padding: 0 14px;
  border-radius: 8px;
  background: #1f8a4c;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
}

.search-shell {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #eadac3;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2933;
  font-size: 16px;
}

.search-placeholder {
  color: #9ca3af;
}

.dish-scroll {
  height: calc(100vh - 236px);
  min-height: 360px;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 8px;
}

.dish-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 76px;
  padding: 12px;
  border: 1px solid #efdfcb;
  border-radius: 8px;
  background: #ffffff;
}

.dish-row.selected {
  border-color: #1f8a4c;
  background: #f2fff7;
}

.select-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border: 2px solid #d5c8b5;
  border-radius: 14px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
}

.dish-row.selected .select-dot {
  border-color: #1f8a4c;
  background: #1f8a4c;
}

.dish-main {
  min-width: 0;
  flex: 1;
}

.dish-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dish-name {
  overflow: hidden;
  color: #1f2933;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-time {
  flex: 0 0 auto;
  color: #e85d3f;
  font-size: 12px;
  font-weight: 700;
}

.dish-meta {
  display: flex;
  gap: 8px;
  margin-top: 7px;
}

.save-button {
  width: 44px;
  border-radius: 22px;
  color: #b5a283;
  font-size: 25px;
}

.save-button.saved {
  color: #e85d3f;
}

.empty-state {
  padding: 48px 18px;
  text-align: center;
}

.empty-title {
  display: block;
  color: #1f2933;
  font-size: 19px;
  font-weight: 800;
}

.empty-note {
  display: block;
  margin-top: 8px;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.55;
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  gap: 12px;
  max-width: 430px;
  margin: 0 auto;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #ecdcc7;
  background: rgba(255, 250, 243, 0.96);
}

.selection-copy {
  min-width: 0;
  flex: 1;
}

.selection-title {
  display: block;
  color: #1f2933;
  font-size: 16px;
  font-weight: 800;
}

.selection-note {
  overflow: hidden;
  margin-top: 4px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.generate-button {
  width: 112px;
  min-height: 48px;
  border-radius: 8px;
  background: #1f8a4c;
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
}

.generate-button.disabled {
  background: #d6c9b8;
}
</style>
