# 前端开发规范

## 1. 工程原则

你是一名资深前端工程师，具备优秀的 UI/UX 设计能力。所有实现须遵循以下原则：

- 优先复用成熟组件库，避免重复造轮子，确保组件源码可控、易于维护。
- 统一设计语言，保持颜色、字体、间距、圆角、图标和动画风格一致。
- 追求高质量视觉效果，页面简洁现代、布局合理、交互流畅，避免过度装饰。
- 严格控制依赖，按需安装，不重复引入功能相似的库。
- 保证功能完整，支持响应式布局、交互反馈及必要的加载、错误和空状态。
- 优先检查现有项目和依赖，复用已有组件，按需选择技术方案。

目标：用最少的必要代码和依赖，实现生产级的视觉效果、交互体验与工程质量。

## 2. 推荐技术栈

| 领域     | 推荐方案                |
| -------- | ----------------------- |
| UI 组件  | shadcn/ui、Radix UI     |
| 视觉组件 | Magic UI、Aceternity UI |
| 图标     | Lucide React            |
| 动画     | Motion                  |
| 样式     | Tailwind CSS            |
| 布局     | react-resizable-panel   |
| 拖拽     | dnd-kit                 |
| 状态管理 | Zustand                 |
| 数据请求 | TanStack Query          |
| 图表     | Recharts                |

使用推荐方案前必须先判断它是否与项目当前技术栈匹配；不得为使用推荐库而重写既有实现。

## 3. 当前项目架构

### 3.1 技术基线

- 使用 Vue 3、Vite、Vue Router 和 Pinia。
- 仅在现有依赖无法满足明确需求时才引入新库。

### 3.2 目录边界

- `src/api`：处理 HTTP 请求、统一响应解析和通用错误。
- `src/modules/<domain>`：放置领域 API、表单校验和领域展示组件。
- `src/stores`：仅管理跨路由状态。
- `src/views`：仅负责页面组装和路由级交互。

### 3.3 认证模块

- 认证业务接口集中于 `src/modules/auth/api.js`。
- Token 仅由 `auth` store 保存和清除；页面组件不得直接读写存储。
- 业务接口成功响应统一为 `{ code: 200, message, data }`。
- 开发联调使用 Vite `/api` 代理访问本地认证服务；组件中不得散落环境地址。

### 3.4 TianAI 滑块验证码

- 使用与后端一致的 TianAI Captcha `1.5.6` 官方 SDK。
- 静态资源位于 `public/tac/tac`，由 `src/modules/auth/TianaiCaptcha.vue` 按需加载。
- SDK 直接调用 `/api/auth/captcha/gen`（后端兼容 `GET` 与 `POST`）和 `/api/auth/captcha/check`。
- 禁止手写图片定位、拖动轨迹或像素校验。
- 校验成功回调中的 `captchaId` 只能用于一次 `/api/auth/sms/send` 请求。
- 修改认证模块时，同步维护本节，记录接口、存储边界或主题 token 的结构性变更，并执行 `npm run build`。
- 登录与注册共用 AuthPanel，样式在 auth-panel.css；全局语义主题 token 位于 App.vue。粉紫/粉蓝用于装饰背景，深紫 --brand 用于可访问操作，文字与状态对比度记录在全局样式注释中，验证码 SDK 使用同一深紫主题。
- 登录接口与 Token 存储边界保持不变；工作台未接入的订单、会员及资料服务明确显示未接入，不使用模拟用户数据。
- 登录首屏视频提供暂停和字幕开关，远程视频不可用时保留本地渐变背景。

## 4. 页面与交互

### 4.1 布局与导航

- 导航栏左侧固定 Logo，右侧导航项按使用频率排序。
- 首屏使用视频背景而非图片，并提供可关闭字幕。
- 服务展示使用不对称卡片；主服务需放大且产生合理偏移。
- 联系表单前置业务问题选择器，降低用户决策成本。
- 动态菜单根据角色权限折叠或展开。

### 4.2 表格与空状态

- 金额列右对齐并显示货币符号。
- 状态标签使用色彩和图标双重编码。
- 操作列使用固定宽度，避免内容过长挤压布局。
- 无数据时展示创建引导和相关教程缩略图。

### 4.3 响应式要求

- 优先使用 CSS container queries 实现组件级响应式。
- 避免硬编码断点、滥用 `vw`/`vh` 和缺少 `srcset` 的响应式图片。
- 确保文字在移动端与桌面端都不溢出、不遮挡。

## 5. 视觉与排版

### 5.1 视觉基线

- 使用 CSS 自定义属性统一管理颜色、间距、边框和焦点状态。
- 认证页面保持清晰单栏工作流、明确验证反馈和移动端可用性。
- 每种颜色使用都需记录用途、对比度数值及其与品牌色的关系；不得仅以“好看”决定颜色。

### 5.2 字体与排版

- 正文：系统字体栈 `-apple-system, BlinkMacSystemFont, 'Segoe UI'`，提升原生感。
- 标题：使用单款特色字体，例如 Clash Grotesk 或 Geist，避免过度设计。
- 正文排版可使用 Satoshi 或 Inter，建议 `16px/1.6` 行高和约 65 字符行宽。
- 代码：JetBrains Mono，背景色 `#f8f9fa`，圆角 `4px`。
- 标题可使用 Clash Grotesk variable font，行高 `1.1`；字距必须根据当前项目规则审慎设置。
- 禁止同时使用超过三种字体、纯装饰性手写体、全文加粗或全文斜体。
- 避免纯黑文字，使用 `#1a1a1a` 等近黑色；段落间距应大于行高。
- 引用区块使用左侧色条和斜体，不仅使用缩进。

### 5.3 主题色

```css
:root {
  --thistle: #cdb4dbff;
  --pastel-petal: #ffc8ddff;
  --baby-pink: #ffafccff;
  --icy-blue: #bde0feff;
  --sky-blue: #a2d2ffff;
}
```

--thistle: #cdb4dbff;
--pastel-petal: #ffc8ddff;
--baby-pink: #ffafccff;
--icy-blue: #bde0feff;
--sky-blue: #a2d2ffff;

## 6. 框架特定约束

当前项目为 Vue。若后续实际采用 React，则必须：

- 使用 `useCallback` 和 `useMemo` 控制不必要的重渲染。
- 为组件提供完整的 prop-types。
- 清理副作用。
- 禁止类组件、`componentWillReceiveProps` 和将内联函数作为 prop 传递。
