<template>
  <view class="phone-page">
    <view class="status-space" />

    <view class="topbar">
      <button class="back-button" @tap="editConditions">‹</button>
      <view class="title-block">
        <text class="title">今天吃什么</text>
        <text class="subtitle">{{ subtitle }}</text>
      </view>
      <view class="topbar-spacer" />
    </view>

    <scroll-view v-if="selectedDishes.length" class="selected-strip" scroll-x>
      <text v-for="name in selectedDishes" :key="name" class="selected-chip">{{ name }}</text>
    </scroll-view>

    <scroll-view class="plan-scroll" scroll-y>
      <view class="plan-card">
        <view class="plan-head">
          <view>
            <text class="plan-title">{{ activePlan.title }}</text>
            <text class="plan-reason">{{ activePlan.reason }}</text>
          </view>
          <view class="plan-stats">
            <text>{{ activePlan.total_time }} 分钟</text>
            <text>{{ activePlan.estimated_cost }} 元</text>
          </view>
        </view>

        <view class="tag-row">
          <text v-for="tag in activePlan.suitable_for" :key="tag" class="tag">{{ tag }}</text>
        </view>

        <view class="section">
          <text class="section-title">菜单</text>
          <view
            v-for="dish in activePlan.dishes"
            :key="dish.name"
            :class="['dish-card', activeCookingDish?.name === dish.name ? 'active' : '']"
            @tap="openCookingDish(dish.name)"
          >
            <view class="dish-head">
              <text class="dish-name">{{ dish.name }}</text>
              <text class="dish-category">看做法 ›</text>
            </view>
            <text class="dish-reason">{{ dish.reason }}</text>
          </view>
        </view>

        <view class="section">
          <text class="section-title">买菜清单</text>
          <view v-for="group in activePlan.shopping_list" :key="group.category" class="shopping-group">
            <text class="group-title">{{ group.category }}</text>
            <view class="shopping-items">
              <text v-for="item in group.items" :key="`${group.category}-${item.name}`" class="shopping-item">{{ item.name }} · {{ item.amount }}</text>
            </view>
          </view>
        </view>

        <view class="section">
          <text class="section-title">按点上桌</text>
          <view v-for="item in activePlan.cooking_schedule" :key="`${item.time}-${item.task}`" class="timeline-row">
            <text class="timeline-time">{{ item.time }}</text>
            <text class="timeline-task">{{ item.task }}</text>
          </view>
        </view>

        <view class="section">
          <text class="section-title">做饭顺序</text>
          <view v-for="(item, index) in activePlan.cooking_order" :key="`${index}-${item}`" class="order-row">
            <text class="order-index">{{ index + 1 }}</text>
            <text class="order-copy">{{ item }}</text>
          </view>
        </view>

        <view v-if="activeCookingDish" class="section">
          <text class="section-title">单道做法</text>
          <view class="recipe-block">
            <text class="recipe-name">{{ activeCookingDish.name }}</text>
            <text
              v-for="(step, index) in activeCookingDish.steps"
              :key="`${activeCookingDish.name}-${index}`"
              class="recipe-step"
            >
              {{ index + 1 }}. {{ step }}
            </text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <button class="primary-button share-button" open-type="share" @tap="shareCurrentPage">分享这一页</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { navigateBackToHome } from "@/adapters/navigation";
import { buildGenerateResponse } from "@/domain/mealPlans";
import { initialPlanIndex } from "@/domain/planSelection";
import { buildResultPageUrl, DEFAULT_GENERATE_REQUEST, parseResultQuery, type ResultQuery } from "@/domain/resultUrl";

const params = ref<ResultQuery>({ ...DEFAULT_GENERATE_REQUEST });
const activePlanIndex = ref(0);
const activeCookingDishName = ref<string | null>(null);
const response = computed(() => buildGenerateResponse(params.value));
const selectedDishes = computed(() => params.value.selected_dishes ?? []);
const subtitle = computed(() =>
  selectedDishes.value.length
    ? `按首页已选 ${selectedDishes.value.length} 道生成`
    : `${params.value.people_count} 人 · 约 ${params.value.budget} 元 · ${params.value.time_limit} 分钟`
);
const activePlan = computed(() => response.value.plans[activePlanIndex.value] ?? response.value.plans[0]);
const activeCookingDish = computed(() =>
  activePlan.value.dishes.find((dish) => dish.name === activeCookingDishName.value) ?? null
);
const sharePath = computed(() => buildResultPageUrl({ ...params.value, planIndex: activePlanIndex.value }));
const shareTitle = computed(() => `${activePlan.value.title}｜今天吃什么`);

onLoad((options) => {
  params.value = parseResultQuery((options ?? {}) as Record<string, string | string[] | undefined>);
  activePlanIndex.value = initialPlanIndex(response.value.plans, params.value.budget, params.value.planIndex);
});

onShareAppMessage(() => ({
  title: shareTitle.value,
  path: sharePath.value,
}));

function openCookingDish(name: string) {
  activeCookingDishName.value = name;
}

function shareCurrentPage() {
  // #ifdef H5
  const h5ShareUrl = typeof window === "undefined" ? sharePath.value : `${window.location.origin}/#${sharePath.value}`;
  uni.setClipboardData({
    data: h5ShareUrl,
    success: () => {
      uni.showToast({ title: "链接已复制", icon: "none" });
    },
  });
  // #endif
}

function editConditions() {
  navigateBackToHome();
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
  gap: 12px;
  padding: 10px 0 12px;
}

.back-button,
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  min-width: 44px;
  min-height: 44px;
  margin: 0;
  border-radius: 22px;
  background: #ffffff;
  color: #e85d3f;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 8px 20px rgba(31, 41, 51, 0.08);
}

.back-button::after,
.icon-button::after {
  border: 0;
}

.icon-button {
  font-size: 22px;
}

.topbar-spacer {
  width: 44px;
  min-width: 44px;
}

.title-block {
  min-width: 0;
  flex: 1;
}

.title {
  display: block;
  color: #1f2933;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
}

.subtitle {
  display: block;
  margin-top: 3px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.35;
}

.selected-strip {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 10px;
}

.selected-chip,
.tag,
.mini-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  margin-right: 8px;
  padding: 0 10px;
  border-radius: 15px;
  background: #fff3e1;
  color: #8a4f1d;
  font-size: 13px;
  font-weight: 700;
}

.insights {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.insight-block,
.plan-card,
.dish-card,
.shopping-group,
.recipe-block {
  border: 1px solid #efdfcb;
  border-radius: 8px;
  background: #ffffff;
}

.insight-block {
  padding: 11px 12px;
}

.insight-label {
  display: block;
  color: #e85d3f;
  font-size: 13px;
  font-weight: 800;
}

.insight-copy {
  display: block;
  margin-top: 4px;
  color: #1f2933;
  font-size: 15px;
  line-height: 1.45;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab {
  flex: 1;
  min-width: 0;
  min-height: 54px;
  padding: 8px 6px;
  border: 1px solid #eadac3;
  border-radius: 8px;
  background: #ffffff;
  text-align: left;
}

.tab.active {
  border-color: #e85d3f;
  background: #fff3e1;
}

.tab-type,
.tab-meta {
  display: block;
}

.tab-type {
  overflow: hidden;
  color: #1f2933;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-meta {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}

.plan-scroll {
  height: calc(100vh - 164px);
  min-height: 350px;
}

.plan-card {
  padding: 14px;
}

.plan-head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.plan-title {
  display: block;
  color: #1f2933;
  font-size: 20px;
  font-weight: 850;
  line-height: 1.25;
}

.plan-reason {
  display: block;
  margin-top: 6px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.plan-stats {
  display: flex;
  flex: 0 0 66px;
  flex-direction: column;
  gap: 6px;
  color: #e85d3f;
  font-size: 13px;
  font-weight: 800;
  text-align: right;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag {
  margin-right: 0;
  background: #fff3e1;
  color: #8a5a22;
}

.section {
  margin-top: 20px;
}

.section-title {
  display: block;
  margin-bottom: 10px;
  color: #1f2933;
  font-size: 18px;
  font-weight: 850;
}

.dish-card {
  margin-bottom: 10px;
  padding: 12px;
}

.dish-card.active {
  border-color: #e85d3f;
  background: #fff6ec;
}

.dish-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dish-name {
  min-width: 0;
  color: #1f2933;
  font-size: 17px;
  font-weight: 850;
}

.dish-category {
  flex: 0 0 auto;
  color: #e85d3f;
  font-size: 13px;
  font-weight: 800;
}

.dish-reason,
.recipe-step,
.recipe-tip,
.order-copy,
.timeline-task {
  display: block;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.55;
}

.dish-reason {
  margin-top: 6px;
}

.mini-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.mini-pill {
  margin-right: 0;
  background: #f6f2ea;
  color: #5d5548;
  font-size: 12px;
}

.shopping-group {
  margin-bottom: 10px;
  padding: 12px;
}

.group-title,
.recipe-name {
  display: block;
  color: #1f2933;
  font-size: 16px;
  font-weight: 850;
}

.shopping-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.shopping-item {
  min-height: 30px;
  padding: 6px 10px;
  border-radius: 15px;
  background: #f6f2ea;
  color: #4b5563;
  font-size: 13px;
}

.timeline-row,
.order-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.timeline-time,
.order-index {
  flex: 0 0 48px;
  color: #e85d3f;
  font-size: 14px;
  font-weight: 850;
}

.order-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-basis: 28px;
  border-radius: 14px;
  background: #e85d3f;
  color: #ffffff;
}

.recipe-block {
  margin-bottom: 12px;
  padding: 12px;
}

.recipe-step {
  margin-top: 8px;
}

.recipe-tip {
  margin-top: 8px;
  color: #8a5a22;
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

.ghost-button,
.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 48px;
  margin: 0;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 850;
  line-height: 1;
}

.ghost-button::after,
.primary-button::after {
  border: 0;
}

.ghost-button {
  border: 1px solid #e85d3f;
  color: #e85d3f;
}

.primary-button {
  background: #e85d3f;
  color: #ffffff;
}

.share-button {
  width: 100%;
}
</style>
