# 今天吃什么 DESIGN.md

## 1. Design Intent

今天吃什么是一个手机优先的家庭买菜做饭助手。界面要让用户在下班、带娃、临时买菜的真实场景里快速完成三件事：选想吃的菜、生成一桌饭、照着买和做。

视觉方向参考 Notion 的清晰信息层级、轻量卡片和可读内容组织，以及 Airbnb 的温暖生活感、圆润触控控件和消费级亲和力。最终风格必须属于今天吃什么本身，不复制 Notion 或 Airbnb 的品牌、图形、商标、插画或专有资产。

核心气质：

- 温暖但不幼稚。
- 清爽但不冷淡。
- 手机上高效，单手能操作。
- 像家庭备餐工具，不像营销落地页。
- 内容密度适中，菜名、时间、清单、步骤都要容易扫读。

## 2. Source References

Reference inputs:

- `awesome-design-md/notion/DESIGN.md`：用于信息层级、卡片系统、柔和彩色标签、清晰文档式内容组织。
- `awesome-design-md/airbnb/DESIGN.md`：用于消费级温暖感、圆润按钮、搜索入口、收藏行为和移动端触控舒适度。

Adaptation rules:

- Use the clarity and card grammar, not the brand identity.
- Do not use Notion purple as the main brand color.
- Do not use Airbnb Rausch red as the main brand color.
- Do not use brand logos, brand illustrations, proprietary fonts, or copied layouts.
- Use system fonts and project-owned color tokens.

## 3. Color System

The product uses a warm light canvas with food-adjacent accents. Avoid one-note beige pages; balance warm surfaces with fresh green and tomato red accents.

```yaml
colors:
  canvas: "#fffaf3"
  canvas-white: "#ffffff"
  surface: "#fff6ea"
  surface-soft: "#f8f3ea"
  surface-green: "#edf8ef"
  surface-yellow: "#fff3cc"
  surface-rose: "#ffe9df"
  surface-blue: "#eaf4ff"

  ink: "#241f1a"
  ink-soft: "#4b4037"
  muted: "#7a6b5f"
  muted-soft: "#a49385"

  primary: "#1f8a4c"
  primary-pressed: "#176d3c"
  primary-soft: "#dff3e6"
  on-primary: "#ffffff"

  accent-tomato: "#e85d3f"
  accent-tomato-pressed: "#c9432c"
  accent-yellow: "#f4b942"
  accent-blue: "#3478f6"

  hairline: "#eadfce"
  hairline-strong: "#d7c6b3"
  shadow: "rgba(50, 36, 20, 0.10)"

  success: "#1f8a4c"
  warning: "#b96f00"
  error: "#c7352b"
```

Color usage:

- Primary green is for the main generate action, selected states, and confirmations.
- Tomato is for high-attention secondary moments such as refresh emphasis, not for every button.
- Yellow is for helpful highlights such as recommended buy items.
- Blue is only for links or copy/share affordances on H5.
- Canvas should feel warm, but most content surfaces remain white for readability.
- Text contrast must meet WCAG AA. Body text uses `ink`, not light gray.

## 4. Typography

Use platform/system fonts for uni-app portability.

```yaml
font-family:
  default: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif"
  number: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

type-scale:
  page-title:
    size: 28px
    weight: 700
    line-height: 1.18
  section-title:
    size: 20px
    weight: 650
    line-height: 1.30
  card-title:
    size: 17px
    weight: 650
    line-height: 1.35
  body:
    size: 16px
    weight: 400
    line-height: 1.55
  body-medium:
    size: 16px
    weight: 500
    line-height: 1.45
  meta:
    size: 13px
    weight: 400
    line-height: 1.40
  label:
    size: 13px
    weight: 600
    line-height: 1.30
  button:
    size: 16px
    weight: 650
    line-height: 1.20
```

Typography rules:

- Do not use oversized landing-page hero type in the app.
- Body text must be at least 16px on mobile.
- Use 13px only for metadata, labels, and helper text.
- Let Chinese text wrap naturally. Do not force single-line truncation for dish names or cooking steps.
- Use tabular/monospace numbers for time, cost, and schedule rows when it improves alignment.

## 5. Shape, Spacing, And Density

```yaml
radius:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px

touch:
  minimum-target: 44px
  preferred-target: 48px
  minimum-gap: 8px
```

Layout density:

- Home page is a tool surface. Keep it compact enough that users can see several dishes per screen.
- Result page can be more content-rich, but section headers must create clear scan breaks.
- Avoid cards inside cards. Use one card per repeated dish or result block.
- Bottom generate bar must reserve safe-area padding and never cover the final list item.

## 6. Component System

### Buttons

Primary button:

- Background `primary`, text `on-primary`.
- Radius `12px`.
- Minimum height `48px`.
- Used for `生成菜谱`, `就用这桌`.
- Disabled state: `hairline` background, `muted` text.

Secondary button:

- White or transparent background.
- 1px `hairline-strong` border.
- Text `ink`.
- Used for `换一桌`, `改条件`, `清空搜索`.

Text button:

- Transparent.
- Text `primary` or `ink-soft`.
- Minimum hit area still 44px.
- Used for toolbar actions like `搜索`, `刷新`, and lightweight links.

### Segmented Tabs

Use segmented controls for:

- 首页 `全部 / 收藏`.
- 结果页三套方案 A/B/C.

Rules:

- Active tab uses filled `primary-soft` or dark text with a 2px indicator.
- Inactive tab uses `muted`.
- Each tab must be at least 44px tall.
- Tab labels must not wrap awkwardly.

### Dish Row

Dish row structure:

- Left status chip: `已选` or `可选`.
- Main content: dish name, category, estimated minutes, note.
- Right action: `收藏` / `已藏`.

Selected dish row:

- Background `surface-green`.
- Border `primary-soft`.
- Status chip filled `primary`.

Unselected dish row:

- Background `canvas-white`.
- Border `hairline`.

Saved dish state:

- The save action changes label to `已藏`.
- Do not rely on icon color only; label must change.

### Search

Search uses a rounded field inspired by consumer marketplace search, adapted for food:

- Height at least 48px.
- Radius `pill` or `16px`.
- Placeholder: `搜菜名、分类、口味或食材`.
- Clear action visible when query has content.
- Search result count may appear as helper text.

### Bottom Submit Bar

The bottom submit bar is fixed/sticky on mobile:

- White surface.
- Top border `hairline`.
- Safe-area bottom padding.
- Left copy: `已选 N 道` and first two dish names.
- Right primary button: `生成菜谱`.
- Empty selection: title `先选一道菜`, button disabled or tap shows toast.

### Result Plan Card

Plan card contains:

- Plan type.
- Estimated cost.
- Total time.
- Dish count.
- Reason.
- Action row.
- Menu.
- Shopping list.
- Schedule.
- Cooking order.
- Recipe steps and tips.

Use section headers and dividers instead of deeply nested surfaces.

### Timeline Row

For `按点上桌计划`:

- Time shown in a fixed-width number column.
- Task text wraps naturally.
- Use a subtle vertical line or repeated row separators, not heavy decoration.

## 7. Page Specifications

### Home Page

Primary goal: choose dishes quickly.

Top area:

- Brand: `今天吃什么`.
- Subtitle: `点几道想吃的菜，直接生成买菜清单和做饭顺序`.
- Optional last choice card appears when `san-zhuo-cai:last-choice` exists.

Toolbar:

- Left segmented control: `全部`, `收藏`.
- Right text actions: `搜索`, `刷新`.
- Search expands in place below toolbar.

Dish list:

- Vertical list on mobile.
- Each row is one tappable selection target plus a separate save action.
- Selected rows stay visible after refresh.

Bottom bar:

- Always visible when list scrolls.
- Shows selected count and generate button.
- Must not cover content.

### Result Page

Primary goal: make the generated dinner executable.

Top area:

- Brand/title: `今天吃什么`.
- Subtitle:
  - With selected dishes: `按首页已选 N 道生成`.
  - Without selected dishes: `N 人 · 约 X 元 · Y 分钟`.
- If selected dishes exist, show a compact strip: `这次围绕` plus dish names.

Recommended section:

- `今日推荐买` as a light yellow or green info band.
- `今天不太推荐` as muted rows with reasons.

Plan tabs:

- Three tabs remain visible near the top of result content.
- Active tab is clear.
- Cost/time metadata visible inside or under each tab.

Plan content:

- Show action row near the top: `就用这桌`, `换一桌`, `改条件`.
- Shopping list must be easy to scan by category.
- Cooking schedule must be above detailed recipes.
- Recipes may be long; use readable spacing and avoid tiny text.

## 8. Interaction States

Required states:

- Loading generation: button disabled, label `生成中...`.
- Empty selected dishes: toast `先选一道菜`.
- Empty search: `没找到这道菜`.
- Empty saved tab: `还没有收藏`.
- Saved success: label changes to `已藏`.
- Last choice saved: toast or inline confirmation `已记住`.
- Swap table: `variant` increments and page regenerates.

State feedback rules:

- Tap feedback appears within 100ms.
- Async operations longer than 300ms show loading text or skeleton.
- Disabled controls must be visually distinct and semantically disabled.
- Errors must be near the failed action.

## 9. Motion

Use subtle motion only:

- Search open/close: 160-220ms height/opacity transition.
- Dish selected state: 120-180ms background/border transition.
- Result plan tab switch: 160-220ms fade/slide.
- Toast: platform default is acceptable.

Do not animate layout-heavy properties in a way that causes jank. Respect reduced-motion where available.

## 10. Accessibility And Mobile Usability

- All primary touch targets are at least 44px, preferably 48px.
- Text contrast meets WCAG AA.
- Do not rely on color alone for selected/saved states.
- Icon-only actions must have text labels or accessible labels.
- The UI must work without hover.
- No horizontal scroll on 375px width.
- Keep fixed bottom controls inside safe area.
- Back navigation must behave predictably on H5 and WeChat Mini Program.
- Long recipe steps must wrap and remain readable.

## 11. Multi-platform Rules

H5:

- May support copy text and share link.
- Can use browser clipboard fallback.
- Layout should cap width on desktop and remain app-like on mobile.

WeChat Mini Program:

- Use native navigation and safe-area behavior.
- Do not depend on DOM APIs.
- Use platform share behavior for sharing.
- Rich HTML clipboard is not required.

Shared:

- Same data.
- Same search rules.
- Same selected dish rules.
- Same result generation rules.
- Same validation and acceptance criteria.

## 12. Acceptance Criteria Alignment

Design must support these product acceptance checks:

- `src/data/` contains the full migrated current `data/` files.
- Migrated catalog still has 302 dishes and 165 ingredients.
- Default 12 home dishes exist in the migrated catalog.
- Search uses the full migrated catalog, not hardcoded page data.
- Meal plans, shopping lists, and recipe steps come from migrated data.
- Favorite a dish, switch to favorite tab, see it; unfavorite and it disappears.
- Refresh preserves selected dishes and changes unselected dishes.
- Empty selection cannot generate and shows `先选一道菜`.
- Result page subtitle shows `按首页已选 N 道生成`.
- First plan dish order equals selected home dishes that exist in the migrated catalog.
- Swap table increments `variant` and regenerates.
- `就用这桌` lets home page reopen the last choice.
- H5 and WeChat Mini Program both run home-to-result end to end.

