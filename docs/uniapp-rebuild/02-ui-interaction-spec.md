# Uni-app UI Interaction Spec

## 1. Purpose

This document defines the UI and interaction requirements for the uni-app rebuild of 今天吃什么. It complements:

- `DESIGN.md` for visual source of truth.
- `docs/uniapp-rebuild/00-current-project-spec.md` for product and data rules.
- `docs/uniapp-rebuild/01-uniapp-implementation-plan.md` for build steps.

The UI direction adapts Notion-like clarity and Airbnb-like warmth through the local `awesome-design-md` references, without copying either brand.

## 2. Design References

Primary reference: Notion

- Use clear card hierarchy.
- Use readable content sections.
- Use soft tinted surfaces for helpful context.
- Use restrained rectangular buttons and cards.

Secondary reference: Airbnb

- Use warm consumer-product tone.
- Use rounded, touch-friendly search and action controls.
- Use clear save/favorite behavior.
- Keep mobile interactions simple and visible.

Project adaptation:

- Food and family context should feel warmer than Notion.
- Utility workflow should be denser than Airbnb marketplace browsing.
- No brand colors, logos, imagery, or copied trademarked design elements.

## 3. Information Architecture

Required pages for v1:

- Home page: pick dishes, search full catalog, favorite dishes, refresh unselected dishes, generate recipe.
- Result page: show generated meal plans and execution details.

Optional later pages:

- Favorite dishes page.
- Meal history page.
- Settings page.

Do not introduce onboarding, account setup, or profile screens in v1 unless required by platform publishing.

## 4. Home Page Layout

### 4.1 Header

Content:

- Brand text: `今天吃什么`.
- Subtitle: `点几道想吃的菜，直接生成买菜清单和做饭顺序`.

Layout:

- Header sits at the top of the scroll content.
- Keep it compact; do not make a marketing hero.
- H5 desktop may center content in a max-width container, but mobile remains the primary layout.

### 4.2 Last Choice Card

Show only when `san-zhuo-cai:last-choice` exists.

Content:

- Title: `上次选了：{planTitle or planType}`.
- Action: `继续看这桌`.

Behavior:

- Tapping the action navigates to stored `resultUrl`.
- If stored data is invalid, hide the card rather than showing a broken state.

### 4.3 Toolbar

Required controls:

- Segmented control: `全部`, `收藏`.
- Text action: `搜索`.
- Text action: `刷新`.

Behavior:

- `全部` shows the visible dish set or search results.
- `收藏` filters to saved dishes.
- `搜索` expands/collapses the search input.
- Closing search clears the query unless implementation intentionally preserves it for same-session continuity.
- `刷新` changes only unselected visible dishes.

Touch:

- Each control has at least 44px hit area.
- The toolbar must fit 375px width without horizontal scroll.

### 4.4 Search Area

Input:

- Placeholder: `搜菜名、分类、口味或食材`.
- Clear action appears when query is non-empty.

Behavior:

- No query: page shows visible 12-dish set.
- Query present: search uses full migrated dish catalog.
- Query present in 收藏 tab: search saved dishes only.
- Multiple words are all-token matching.

Status:

- Optional helper text: `全部菜库找到 N 道菜` or `收藏里找到 N 道`.

### 4.5 Dish List

Each dish row includes:

- Status chip: `已选` or `可选`.
- Dish name.
- Metadata: `{category} · {time} 分钟 · {note}`.
- Save action: `收藏` or `已藏`.

Selection:

- Tapping main row toggles selected state.
- Selected row remains selected after refresh.
- Selected row has visible background and status change, not color alone.
- Selected count updates immediately.

Favorite:

- Tapping `收藏` saves the dish.
- In 收藏 tab, saved dish appears.
- Tapping `已藏` removes it.
- After removal in 收藏 tab, the row disappears.

Empty states:

- Search empty: title `没找到这道菜`; copy `换个菜名、分类或口味试试，比如“汤”“快手”“番茄”。`
- Favorite empty: title `还没有收藏`; copy `看到常吃的菜，点收藏，下次会在这里出现。`

### 4.6 Bottom Generate Bar

Content:

- Left title:
  - selected: `已选 N 道`
  - empty: `先选一道菜`
- Left description:
  - selected: first two selected dishes plus `等 N 道` when needed.
  - empty: `点菜名就能加入菜单`
- Right button: `生成菜谱`.

Behavior:

- If selected count is 0, tapping generate shows toast `先选一道菜`.
- If selected count is greater than 0, generate navigates to result page.
- Generate button shows loading state if navigation or generation is delayed.

Layout:

- Sticky to bottom on mobile.
- Includes safe-area bottom padding.
- Content list has bottom padding so the final dish row is not covered.

## 5. Result Page Layout

### 5.1 Header

Content:

- Brand/title: `今天吃什么`.
- Subtitle:
  - With selected dishes: `按首页已选 N 道生成`.
  - Without selected dishes: `{people} 人 · 约 {budget} 元 · {time} 分钟`.

Required acceptance:

- After generating from home selected dishes, subtitle must show `按首页已选 N 道生成`.

### 5.2 Selected Dish Strip

Show only when selected dishes exist.

Content:

- Label: `这次围绕`.
- Dish list: selected dish names, wrapping naturally.

Style:

- Soft green or warm surface.
- Compact enough to avoid pushing plan tabs too far down.

### 5.3 Daily Recommendation Section

Required content:

- `今日推荐买`.
- `今天不太推荐`.
- Reasons for not recommended items.

Style:

- Use tinted info surfaces.
- Do not use alert styling unless there is an actual error.

### 5.4 Plan Tabs

Each tab shows:

- Letter A/B/C.
- Plan type.
- Estimated cost.
- Total time.

Behavior:

- Tapping a tab changes active plan without losing page scroll unexpectedly.
- Active tab has strong visual state.
- URL `planIndex` can restore active plan when present.

### 5.5 Plan Action Row

Actions:

- Primary: `就用这桌`.
- Secondary: `换一桌`.
- Secondary: `改条件`.

Behavior:

- `就用这桌` stores current choice and allows home page to reopen it.
- `换一桌` increments `variant` by 1 and regenerates the result.
- `改条件` returns to home page or previous page.

### 5.6 Plan Content Sections

Required sections in order:

1. 菜单
2. 买菜清单
3. 按点上桌计划
4. 做饭顺序
5. 每道菜做法

Menu:

- Each dish shows name and reason.
- First plan dish order must equal selected home dishes that exist in the migrated catalog.

Shopping list:

- Group by ingredient category.
- Each item shows name and amount.
- List must come from migrated data.

Schedule:

- Time column visible.
- Task wraps naturally.
- Final task should make it clear the meal is ready.

Cooking order:

- Numbered steps.
- Short enough to scan before cooking.

Recipes:

- Each dish has a title.
- Steps are numbered.
- Tips appear after steps.
- Long text must remain readable on mobile.

## 6. Required States

### Loading

Use for:

- Generate action.
- Result regeneration after `换一桌` when not instant.

Rules:

- Disable repeated primary action while loading.
- Keep current content visible if regenerating.

### Empty

Required empty states:

- No search results.
- No favorites.
- No selected dishes when generating.

### Error

Required error surfaces:

- Data load failure: explain that dish data is unavailable.
- Generation failure: keep user on current page and offer retry.
- Invalid last choice: hide or clear last choice; do not navigate to a broken page.

### Success

Required success feedback:

- `就用这桌` should show a toast or inline confirmation.
- Favorite state changes immediately.

## 7. Cross-platform Behavior

### H5

- The app runs as a mobile-first web app.
- Desktop width is capped; do not stretch rows across the full browser.
- Browser back should work from result to home.
- Copy/share enhancements are allowed but not required by v1 acceptance.

### WeChat Mini Program

- Use native navigation.
- Respect safe areas and bottom gesture area.
- Use `uni.showToast` or platform equivalent for empty selection and save confirmations.
- Do not rely on DOM, hover, browser clipboard, or CSS features unsupported by mini-program builds.

### Shared

- Same acceptance criteria on both H5 and WeChat.
- Same data files.
- Same search rules.
- Same meal generation rules.
- Same local storage keys unless a migration layer is explicitly added.

## 8. Accessibility And Usability Checklist

Before marking UI complete:

- All tappable controls are at least 44px high or have expanded hit area.
- There is no horizontal scroll on 375px mobile width.
- Bottom bar does not cover content.
- Search, favorite, refresh, generate, plan tab, swap, and remember actions all have visible feedback.
- Selected and saved states are visible by label, not just color.
- Error and empty states use plain Chinese and tell the user what to do next.
- Body text is at least 16px.
- Metadata text is still readable at 13px.
- Long dish names and recipe steps wrap instead of clipping.

## 9. Visual QA Checklist

Capture or inspect both H5 and WeChat Mini Program screens:

- Home default state.
- Home search open with query `汤`.
- Home favorite tab after saving one dish.
- Home empty favorite tab after unsaving.
- Home with zero selected dishes and generate toast.
- Home after refresh with selected dishes preserved.
- Result page generated from selected dishes.
- Result page after switching plan tab.
- Result page after `换一桌`.
- Result page after `就用这桌` and return home.

## 10. Acceptance Criteria

The UI is not complete until these pass:

- `src/data/` contains full migrated current `data/` files.
- Migrated catalog still has 302 dishes and 165 ingredients.
- Default 12 home dishes all exist in migrated data.
- Search uses the full migrated catalog, not page-hardcoded data.
- Meal generation, shopping lists, and recipe steps come from migrated data.
- Favorite a dish, switch to favorite tab, see it; unfavorite and it disappears.
- Refresh preserves selected dishes and changes unselected dishes.
- Empty selection cannot generate and shows `先选一道菜`.
- Result page subtitle shows `按首页已选 N 道生成`.
- First plan dish order equals selected home dishes that exist in the migrated catalog.
- Swap table increments `variant` and regenerates.
- `就用这桌` lets home page reopen the last choice.
- H5 and WeChat Mini Program both run home-to-result end to end.

