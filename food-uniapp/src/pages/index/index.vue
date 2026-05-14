<template>
  <view class="phone-page">
    <view class="status-space" />

    <view class="topbar">
      <view>
        <text class="eyebrow">今日 7 道候选</text>
        <text class="title">今天吃什么</text>
      </view>
      <button class="refresh-button" @tap="refreshDishes">换一批</button>
    </view>

    <view v-if="lastChoice" class="last-choice" @tap="openLastChoice">
      <text class="last-label">上次选择</text>
      <text class="last-title">{{ lastChoice.title }}</text>
      <text class="last-arrow">›</text>
    </view>

    <view class="toolbar">
      <view class="segmented">
        <button :class="['segment', activeTab === 'all' ? 'active' : '']" @tap="activeTab = 'all'">全部</button>
        <button :class="['segment', activeTab === 'saved' ? 'active' : '']" @tap="activeTab = 'saved'">收藏</button>
      </view>
    </view>

    <view class="search-shell">
      <view class="search-label-row">
        <text class="search-label">搜索菜库</text>
        <text class="search-help">搜菜名、食材、汤、快手</text>
      </view>
      <input
        v-model="searchQuery"
        class="search-input"
        confirm-type="search"
        placeholder="例如：番茄、鸡翅、清淡"
        placeholder-class="search-placeholder"
      />
    </view>

    <view class="dish-panel">
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
    </view>

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
  HOME_DISH_COUNT,
  HOME_DISH_POOL,
  getDailyHomeDishNames,
  homeDateKey,
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
  SELECTED_DISHES_DATE_KEY,
  VISIBLE_DISHES_DATE_KEY,
  VISIBLE_DISHES_KEY,
  type LastChoice,
} from "@/domain/storageKeys";
import { DEFAULT_GENERATE_REQUEST, buildResultPageUrl } from "@/domain/resultUrl";

type TabName = "all" | "saved";

const activeTab = ref<TabName>("all");
const searchQuery = ref("");
const selectedNames = ref<string[]>([]);
const visibleNames = ref<string[]>(getDailyHomeDishNames());
const savedNames = ref<string[]>([]);
const lastChoice = ref<LastChoice | null>(null);

function loadState() {
  const today = homeDateKey();
  const dailyNames = getDailyHomeDishNames();
  const savedSelectedDate = readStorage<string | null>(SELECTED_DISHES_DATE_KEY, null);
  selectedNames.value =
    savedSelectedDate === today
      ? normalizeHomeDishNames(readStorage<unknown>(SELECTED_DISHES_KEY, null), [], {
          allowEmpty: true,
          limit: HOME_DISH_COUNT,
        })
      : [];
  writeStorage(SELECTED_DISHES_KEY, selectedNames.value);
  writeStorage(SELECTED_DISHES_DATE_KEY, today);
  const savedVisibleDate = readStorage<string | null>(VISIBLE_DISHES_DATE_KEY, null);
  visibleNames.value =
    savedVisibleDate === today
      ? normalizeHomeDishNames(readStorage<unknown>(VISIBLE_DISHES_KEY, null), dailyNames, {
          limit: HOME_DISH_COUNT,
        })
      : dailyNames;
  writeStorage(VISIBLE_DISHES_KEY, visibleNames.value);
  writeStorage(VISIBLE_DISHES_DATE_KEY, today);
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
  writeStorage(SELECTED_DISHES_DATE_KEY, homeDateKey());
}

function isSelected(name: string): boolean {
  return selectedNames.value.includes(name);
}

function isSaved(name: string): boolean {
  return savedNames.value.includes(name);
}

function toggleSelected(name: string) {
  if (isSelected(name)) {
    selectedNames.value = selectedNames.value.filter((item) => item !== name);
    persistSelected();
    return;
  }

  if (selectedNames.value.length >= HOME_DISH_COUNT) {
    uni.showToast({ title: `最多选 ${HOME_DISH_COUNT} 道`, icon: "none" });
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
  writeStorage(VISIBLE_DISHES_DATE_KEY, homeDateKey());
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
button {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  line-height: 1;
}

button::after {
  border: 0;
}

.phone-page {
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  padding: 0 14px 80px;
  background: #fff7ed;
}

.status-space {
  height: calc(8px + env(safe-area-inset-top));
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 8px;
}

.eyebrow,
.last-label,
.selection-note,
.dish-meta {
  display: block;
  color: #8a5a44;
  font-size: 12px;
  line-height: 1.32;
}

.title {
  display: block;
  margin-top: 2px;
  color: #2a201c;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
}

.refresh-button,
.save-button {
  min-width: 44px;
  min-height: 44px;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.last-choice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  margin-bottom: 8px;
  padding: 7px 10px;
  border: 1px solid #f1c7a2;
  border-radius: 8px;
  background: #fffdfa;
}

.last-title {
  overflow: hidden;
  flex: 1;
  margin: 0 8px;
  color: #2a201c;
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-arrow {
  color: #c2410c;
  font-size: 22px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.segmented {
  display: flex;
  flex: 1;
  min-height: 40px;
  padding: 3px;
  border: 1px solid #f0c09b;
  border-radius: 8px;
  background: #ffead7;
}

.segment {
  flex: 1;
  min-height: 34px;
  border-radius: 6px;
  color: #8a5a44;
  font-size: 14px;
  font-weight: 700;
}

.segment.active {
  background: #ffffff;
  color: #2a201c;
  box-shadow: 0 5px 12px rgba(124, 45, 18, 0.08);
}

.refresh-button {
  padding: 0 13px;
  border-radius: 8px;
  background: #c2410c;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.search-shell {
  margin-bottom: 7px;
  padding: 7px 10px 8px;
  border: 1px solid #f0c09b;
  border-radius: 8px;
  background: #fffdfa;
}

.search-label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.search-label {
  color: #2a201c;
  font-size: 14px;
  font-weight: 800;
}

.search-help {
  color: #9a6a52;
  font-size: 12px;
}

.search-input {
  width: 100%;
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid #f1c7a2;
  border-radius: 8px;
  background: #fff7ed;
  color: #2a201c;
  font-size: 15px;
}

.search-placeholder {
  color: #9ca3af;
}

.dish-panel {
  min-height: 0;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dish-row {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 48px;
  padding: 5px 9px;
  border: 1px solid #f2caa9;
  border-radius: 8px;
  background: #fffdfa;
}

.dish-row.selected {
  border-color: #c2410c;
  background: #ffedd5;
}

.select-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border: 2px solid #e4b58e;
  border-radius: 11px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.dish-row.selected .select-dot {
  border-color: #c2410c;
  background: #c2410c;
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
  color: #2a201c;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-time {
  flex: 0 0 auto;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.dish-meta {
  display: flex;
  gap: 8px;
  margin-top: 3px;
}

.save-button {
  width: 38px;
  height: 38px;
  min-width: 38px;
  min-height: 38px;
  border-radius: 19px;
  color: #c79a7a;
  font-size: 21px;
  background: #fff7ed;
}

.save-button.saved {
  color: #c2410c;
}

.empty-state {
  padding: 30px 18px;
  text-align: center;
}

.empty-title {
  display: block;
  color: #2a201c;
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
  padding: 8px 14px calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid #f0c09b;
  background: rgba(255, 247, 237, 0.97);
}

.selection-copy {
  min-width: 0;
  flex: 1;
}

.selection-title {
  display: block;
  color: #2a201c;
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
  min-height: 44px;
  border-radius: 8px;
  background: #c2410c;
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
}

.generate-button.disabled {
  background: #e0b99a;
}

@media (max-height: 740px) {
  .phone-page {
    padding: 0 12px 64px;
  }

  .status-space {
    height: calc(4px + env(safe-area-inset-top));
  }

  .topbar {
    padding: 4px 0 6px;
  }

  .title {
    font-size: 22px;
  }

  .eyebrow,
  .last-label,
  .selection-note,
  .dish-meta {
    font-size: 11px;
  }

  .refresh-button {
    min-height: 38px;
    padding: 0 11px;
  }

  .toolbar {
    margin-bottom: 6px;
  }

  .segmented {
    min-height: 34px;
  }

  .segment {
    min-height: 28px;
    font-size: 13px;
  }

  .search-shell {
    margin-bottom: 6px;
    padding: 6px 8px 7px;
  }

  .search-label-row {
    margin-bottom: 4px;
  }

  .search-label {
    font-size: 13px;
  }

  .search-help {
    font-size: 11px;
  }

  .search-input {
    min-height: 32px;
    font-size: 14px;
  }

  .dish-list {
    gap: 4px;
  }

  .dish-row {
    min-height: 39px;
    padding: 4px 8px;
  }

  .dish-name {
    font-size: 14px;
  }

  .dish-time {
    font-size: 11px;
  }

  .dish-meta {
    display: none;
  }

  .select-dot {
    width: 20px;
    height: 20px;
    flex-basis: 20px;
  }

  .save-button {
    width: 34px;
    height: 34px;
    min-width: 34px;
    min-height: 34px;
    font-size: 19px;
  }

  .bottom-bar {
    padding: 7px 12px calc(7px + env(safe-area-inset-bottom));
  }

  .selection-title {
    font-size: 14px;
  }

  .generate-button {
    min-height: 40px;
    font-size: 15px;
  }
}
</style>
