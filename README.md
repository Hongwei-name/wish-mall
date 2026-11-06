# WISH MALL

WISH MALL 是一个基于 Vue 3 的商城前端原型，当前聚焦于**用户认证**与**个人中心**体验。项目提供密码登录、短信登录、短信注册及 TianAI 滑块验证码，并通过 Vite 代理与本地认证服务联调。

> 当前个人中心中的订单、资产和常用服务均为界面演示数据；点击后会显示待接入提示，尚未连接对应业务接口。

## 功能概览

- **认证工作流**：支持密码登录、短信验证码登录与短信注册。
- **安全验证**：发送短信前接入 TianAI Captcha 1.5.6 滑块验证码，验证码资源按需加载。
- **表单反馈**：包含中国大陆手机号、6 位验证码、8 位以上密码校验，以及请求中、成功和失败状态反馈。
- **会话管理**：使用 Pinia 管理 Token，并仅在浏览器 `sessionStorage`（键名：`wish-mall.auth-token`）中保存当前会话。
- **路由守卫**：未登录访问个人中心会跳转登录页；已登录访问登录页会回到个人中心。
- **响应式界面**：认证页与个人中心适配桌面和移动端；个人中心展示订单状态、近期订单、资产与常用服务的演示布局。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3 |
| 构建工具 | Vite 8 |
| 路由 | Vue Router 5 |
| 状态管理 | Pinia 4 |
| 验证码 | TianAI Captcha 1.5.6（静态 SDK） |
| 代码格式化 | Prettier |

## 环境要求

- Node.js：`^22.18.0` 或 `>=24.12.0`
- npm：随 Node.js 安装即可
- 本地认证后端：默认运行在 `http://localhost:2003`

## 快速开始

```bash
# 进入项目目录
cd wish-mall

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后按终端输出的地址在浏览器中打开应用。开发请求以 `/api` 开头时会由 Vite 自动转发至本地认证服务。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器并启用热更新。 |
| `npm run build` | 构建生产环境静态资源到 `dist`。 |
| `npm run preview` | 本地预览已构建的生产包。 |
| `npm run format` | 使用 Prettier 格式化 `src/` 下的代码。 |

## 后端联调

开发环境的代理定义在 [`vite.config.js`](./vite.config.js)：

```text
浏览器请求 /api/*
        ↓
http://localhost:2003/*
```

代理会去除请求路径中的 `/api` 前缀。例如，前端调用 `/api/auth/login/password` 时，后端实际接收 `/auth/login/password`。

前端统一按以下结构处理成功响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

网络异常、非 JSON 响应、HTTP 非成功状态或业务 `code` 不为 `200` 时，页面会显示接口返回的错误信息或通用提示。

### 认证接口

| 前端路径 | 方法 | 用途 |
| --- | --- | --- |
| `/api/auth/captcha/gen?type=SLIDER` | GET | 获取滑块验证码数据。 |
| `/api/auth/captcha/check` | SDK 请求 | 校验滑块验证码。 |
| `/api/auth/sms/send` | POST | 通过已验证的 `captchaId` 发送短信验证码。 |
| `/api/auth/login/password` | POST | 使用手机号和密码登录。 |
| `/api/auth/login/sms` | POST | 使用手机号和短信验证码登录。 |
| `/api/auth/register/sms` | POST | 使用手机号、短信验证码和密码注册。 |

登录或注册成功的 `data` 需要包含 `token` 字段。短信发送请求的 `captchaId` 来自一次成功的滑块验证，应仅用于该次发送操作。

## 路由

| 路径 | 页面 | 访问规则 |
| --- | --- | --- |
| `/` | — | 自动重定向至 `/profile`。 |
| `/auth` | 登录 / 注册 | 已登录时自动跳转 `/profile`。 |
| `/profile` | 个人中心 | 需要登录，未登录时跳转 `/auth`。 |

## 项目结构

```text
wish-mall/
├── public/tac/tac/          # TianAI Captcha 静态资源
├── src/
│   ├── api/http.js          # 通用请求与响应错误处理
│   ├── modules/auth/        # 认证接口、校验与验证码组件
│   ├── router/              # 路由与认证守卫
│   ├── stores/auth.js       # 会话 Token 状态
│   └── views/               # 认证页和个人中心页面
├── vite.config.js           # Vite 配置与 /api 代理
└── package.json             # 依赖与脚本
```

## 开发约定

- 领域接口统一放在 `src/modules/<domain>/api.js`，通用 HTTP 逻辑放在 `src/api/http.js`。
- Token 只可通过 `src/stores/auth.js` 读写；页面和领域组件不要直接操作浏览器存储。
- 组件调用后端时使用相对的 `/api` 路径，不要散落环境地址。
- TianAI Captcha 由 `src/modules/auth/TianaiCaptcha.vue` 管理；不要自行实现滑块轨迹、图片定位或像素校验。
- 新增或调整认证能力后，请同步更新本 README，并执行 `npm run build` 验证构建。

## 后续计划

- 接入商品、购物车、订单、地址、资产与消息中心等真实业务接口。
- 将个人中心演示数据替换为服务端数据，并补充加载、空状态与错误重试。
- 发布用户协议、隐私政策和找回密码页面。

## 许可证

当前仓库未声明许可证。若计划对外发布或复用，请先补充适用的 LICENSE 文件。
