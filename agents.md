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
- `src/api/http.js` 通过 `setAuthTokenProvider` 注入 Token，统一附加 `Authorization: Bearer`，并保留后端业务错误码。
- `auth` store 的 `ensureSession()` 调用 `/auth/me` 校验 Token 与账号状态；`logout()` 调用 `/auth/logout` 后清理本地会话。
- 路由守卫异步执行 `ensureSession()`；未登录或 Token 失效时跳转 `/auth` 并携带 `redirect`，登录后返回原目标页。
- 业务接口成功响应统一为 `{ code: 200, message, data }`。
- 开发联调使用 Vite `/api` 代理访问本地认证服务；组件中不得散落环境地址。
- 新增认证接口：`GET /auth/me`、`POST /auth/logout`、`POST /auth/password/reset`；`/auth/password/reset` 使用短信验证码重置密码。

### 3.4 TianAI 滑块验证码

- 使用与后端一致的 TianAI Captcha `1.5.6` 官方 SDK。
- 静态资源位于 `public/tac/tac`，由 `src/modules/auth/TianaiCaptcha.vue` 按需加载。
- SDK 直接调用 `/api/auth/captcha/gen`（后端兼容 `GET` 与 `POST`）和 `/api/auth/captcha/check`。
- 禁止手写图片定位、拖动轨迹或像素校验。
- 校验成功回调中的 `captchaId` 只能用于一次 `/api/auth/sms/send` 请求；请求同时携带当前 `scene`（`register` / `login` / `reset-password`），后端按场景独立限流；`prod` 调用 PNVS 发送，`test` 只在控制台打印验证码。
- 修改认证模块时，同步维护本节，记录接口、存储边界或主题 token 的结构性变更，并执行 `npm run build`。
- 登录、注册与找回密码共用 AuthPanel，表单样式在 auth-panel.css，首屏视觉在 auth-page.css，布局与响应式在 auth-page-layout.css；全局语义主题 token 位于 App.vue。按用户要求使用 #4176E6 品牌蓝，--brand-ink / --brand-strong 用于小字链接与深色交互；--glass / --glass-border 用于雾透表面，文字与状态对比度记录在全局样式注释中。验证码 SDK 从全局 --brand-soft / --brand 读取主题，接口与 Token 边界不变。
- 登录接口路径保持不变；Token 仍存 sessionStorage，但路由守卫通过 `/auth/me` 校验，退出登录调用 `/auth/logout`。注册与重置密码要求 8-64 位且包含字母和数字；找回密码使用同一短信验证码流程，短信发送带 `scene` 供后端区分场景限流。
- 登录首屏视频提供暂停和字幕开关，远程视频不可用时保留本地渐变背景。

### 3.5 小愿助手

- 工作台左下角「小愿」卡片为整卡按钮，点击打开右侧悬浮抽屉；布局、卡片、侧边导航与配色保持不变。
- 抽屉组件位于 `src/modules/assistant/AssistantDrawer.vue`，通过 `Teleport` 挂载到 `body`，带轻遮罩、焦点陷阱、Esc/遮罩关闭与滚动锁定，不挤压原页面。
- 对话请求走 `GET /api/assistant/chat`（EventSource，参数 message / conversationId），开发环境由 Vite 将 `/api/assistant` 代理到 `http://localhost:2002`；默认 message 事件推送 Markdown 分片，命名 done 事件表示正常结束。
- `[STREAM_INTERRUPT]` / `[ERROR]服务异常` 只由后端产生，前端收到后标记断流并显示 hover 刷新图标（仅 aria-label，无可见文字），不会写入 Markdown；5 秒无新数据也判定断流。
- 重试复用同一 conversationId 与上一轮提问；AI 气泡用 marked + DOMPurify 渲染 GFM，用户气泡纯文本。EventSource 无法附带 Authorization，接入鉴权时需改为 fetch-SSE 或 Cookie。
- 商品与订单工具依赖后续业务服务；AI 服务重启后加载新接口。

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
- 图标统一使用 `@lucide/vue` 官方组件，经 `AccountIcon` 按业务名称映射，保持 24px 网格、2px 描边、圆角线端与连接；hover 仅做约 8% 的轻微放大并柔和过渡，尊重系统减少动态效果设置。
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
  --brand: #4176e6; /* 品牌主色、装饰与大字加粗 CTA */
  --brand-ink: #2857b5; /* 小字链接，白底约 6.7:1 */
  --brand-strong: #2857b5; /* hover 与强调交互 */
  --brand-soft: #eaf1ff; /* 品牌浅色背景 */
  --glass: rgb(255 255 255 / 72%);
  --glass-border: rgb(255 255 255 / 85%);
}
```

雾透效果使用半透明白色、backdrop-filter 与柔蓝投影；输入和正文保持清晰对比。尊重系统减少动态效果设置。

## 6. 框架特定约束

当前项目为 Vue。若后续实际采用 React，则必须：

- 使用 `useCallback` 和 `useMemo` 控制不必要的重渲染。
- 为组件提供完整的 prop-types。
- 清理副作用。
- 禁止类组件、`componentWillReceiveProps` 和将内联函数作为 prop 传递。
