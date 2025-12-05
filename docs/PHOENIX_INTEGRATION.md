# Phoenix 框架集成指南

## 概述

本文档分析了 `inertia-adapter-solid` 库如何与 Phoenix (Elixir) 框架进行更好的集成。Phoenix 是一个用 Elixir 编写的高性能 Web 框架，与 Inertia.js 结合可以构建现代的全栈应用。

## 当前状态

`inertia-adapter-solid` 是一个通用的胶水库，为 SolidJS 提供 Inertia.js 适配器。目前主要针对 Laravel 生态系统设计，但其核心功能是后端无关的。

## Phoenix 集成改进点

### 1. 路由命名约定

**现状**: 当前路由解析假设 Laravel 的页面命名约定 (`./Pages/**/*.jsx`)

**改进建议**:
- 支持 Phoenix 风格的路由命名 (如 `lib/my_app_web/live/` 目录结构)
- 添加配置选项允许自定义页面路径模式

```tsx
createInertiaApp({
  resolve(name) {
    // Phoenix 风格：组件名可能使用下划线命名
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })
    // 支持 snake_case 到 PascalCase 转换
    const normalizedName = name.replace(/_(\w)/g, (_, letter) => letter.toUpperCase())
    return pages[`./pages/${normalizedName}.tsx`]
  },
  // ...
})
```

### 2. CSRF Token 处理

**Phoenix 特性**: Phoenix 使用 `_csrf_token` 作为表单安全令牌

**改进建议**: 在表单组件和 Link 组件中自动获取和包含 CSRF token

```tsx
// 建议添加到 Form 组件
interface PhoenixFormProps {
  csrfToken?: string
  csrfMeta?: string // 从 meta 标签读取
}
```

### 3. Flash 消息集成

**Phoenix 特性**: Phoenix 有内置的 flash 消息系统

**改进建议**: 添加 `useFlash` hook 来读取 Phoenix flash 消息

```tsx
// 建议的新 hook
export function useFlash() {
  const page = usePage()
  return () => page.props.flash as { info?: string; error?: string }
}
```

### 4. Socket/LiveView 兼容性

**Phoenix 特性**: Phoenix LiveView 使用 WebSocket 进行实时更新

**改进建议**:
- 考虑与 Phoenix Channels 的集成
- 提供 hook 用于监听 Phoenix 事件

```tsx
// 建议添加 Phoenix Channels 支持
export function usePhoenixChannel(topic: string) {
  // 连接到 Phoenix Channel
  // 支持实时数据更新
}
```

### 5. 资产路径处理

**Phoenix 特性**: Phoenix 使用 `priv/static` 作为静态资源目录

**改进建议**: 提供资产路径助手函数

```tsx
// 建议添加的助手函数
export function assetPath(path: string): string {
  // 处理 Phoenix 的静态资产路径
  return `/assets/${path}`
}
```

## 文件路由系统

### 新增功能

我们添加了文件路由系统支持，类似于 Next.js/SvelteKit 的路由约定。这对 Phoenix 用户特别有用，因为可以更好地组织前端页面。

### 使用方式

```tsx
import { FileRouter, buildRoutes, RouteModule } from 'inertia-adapter-solid/router'

// 使用 Vite 的 glob 导入
const routeModules = import.meta.glob<RouteModule>(
  './routes/**/[+](page|layout|error|loading).tsx',
  { eager: true }
)

const routes = buildRoutes(routeModules)

function App() {
  return <FileRouter routes={routes} />
}
```

### 路由文件约定

```
routes/
├── +page.tsx          # / 首页
├── +layout.tsx        # 全局布局
├── about/
│   └── +page.tsx      # /about 关于页
├── users/
│   ├── +page.tsx      # /users 用户列表
│   ├── +layout.tsx    # 用户模块布局
│   └── [id]/
│       └── +page.tsx  # /users/:id 用户详情
└── posts/
    └── [...slug]/
        └── +page.tsx  # /posts/* 文章 (catch-all)
```

### 特殊文件

| 文件 | 用途 |
|------|------|
| `+page.tsx` | 页面组件 |
| `+layout.tsx` | 布局组件（可嵌套） |
| `+error.tsx` | 错误边界组件 |
| `+loading.tsx` | 加载状态组件 |

## Phoenix 推荐配置

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  build: {
    outDir: '../priv/static/assets',
    emptyOutDir: true,
    manifest: true,
  },
  server: {
    origin: 'http://localhost:5173',
  },
})
```

### Phoenix 控制器

```elixir
# lib/my_app_web/controllers/page_controller.ex
defmodule MyAppWeb.PageController do
  use MyAppWeb, :controller
  use Inertia.Controller

  def index(conn, _params) do
    render_inertia(conn, "Home", props: %{
      user: get_current_user(conn)
    })
  end
end
```

## 未来路线图

1. **v1.1**: 添加 `useFlash` hook
2. **v1.2**: Phoenix Channels 集成
3. **v1.3**: LiveView 兼容模式
4. **v2.0**: 完整的 Phoenix 优化包

## 贡献

欢迎提交 PR 来改进 Phoenix 集成！请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解更多信息。

## 相关资源

- [Phoenix Framework](https://www.phoenixframework.org/)
- [Inertia.js Phoenix Adapter](https://github.com/inertiajs/inertia-phoenix)
- [SolidJS 官方文档](https://www.solidjs.com/)
