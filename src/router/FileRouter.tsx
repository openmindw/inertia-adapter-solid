import { type Component, ErrorBoundary, type JSX, Suspense, createMemo } from 'solid-js'
import { type RouteModule, RouterProvider, filePathToRoutePattern, matchPath, useRouter } from './index'

export interface ErrorFallbackProps {
  error: Error
  reset: () => void
}

export type ErrorComponent = Component<ErrorFallbackProps>

export interface RouteDefinition {
  pattern: string
  page?: Component
  layout?: Component
  error?: ErrorComponent
  loading?: Component
  depth: number
}

export type RouteModules = Record<string, RouteModule>

/**
 * Build routes from glob-imported route modules
 *
 * @example
 * ```tsx
 * // Import all route modules using Vite's glob import
 * // Use [+] to match the literal '+' character
 * const routeModules = import.meta.glob<RouteModule>(
 *   '../routes/** /[+](page|layout|error|loading).tsx',
 *   { eager: true }
 * )
 * const routes = buildRoutes(routeModules)
 * ```
 */
export function buildRoutes(routeModules: RouteModules): Map<string, RouteDefinition> {
  const routes = new Map<string, RouteDefinition>()

  for (const [filePath, module] of Object.entries(routeModules)) {
    const pattern = filePathToRoutePattern(filePath)
    const existing = routes.get(pattern) || {
      pattern,
      depth: pattern.split('/').filter(Boolean).length,
    }

    // Use specific exports first, then fallback to default export
    if (filePath.includes('/+page.tsx') || filePath.includes('/+page.jsx')) {
      existing.page = module.Page || module.default
    }
    if (filePath.includes('/+layout.tsx') || filePath.includes('/+layout.jsx')) {
      existing.layout = module.Layout || module.default
    }
    if (filePath.includes('/+error.tsx') || filePath.includes('/+error.jsx')) {
      existing.error = module.Error || module.default
    }
    if (filePath.includes('/+loading.tsx') || filePath.includes('/+loading.jsx')) {
      existing.loading = module.Loading || module.default
    }

    routes.set(pattern, existing)
  }

  return routes
}

/**
 * Get layouts for a given path (including parent layouts)
 */
export function getLayoutsForPath(routes: Map<string, RouteDefinition>, pathname: string): Component[] {
  const layouts: Component[] = []
  const segments = pathname.split('/').filter(Boolean)

  // Check root layout
  const rootRoute = routes.get('/')
  if (rootRoute?.layout) {
    layouts.push(rootRoute.layout)
  }

  // Check nested layouts
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const route = routes.get(currentPath)
    if (route?.layout) {
      layouts.push(route.layout)
    }
  }

  return layouts
}

/**
 * Find matching route for pathname
 */
export function findMatchingRoute(routes: Map<string, RouteDefinition>, pathname: string): RouteDefinition | null {
  // First try exact match
  const exact = routes.get(pathname)
  if (exact?.page) {
    return exact
  }

  // Then try pattern matching for dynamic routes
  for (const [pattern, route] of routes) {
    const match = matchPath(pattern, pathname)
    if (match && route.page) {
      return route
    }
  }

  return null
}

// Default error fallback component
function DefaultErrorFallback(props: ErrorFallbackProps): JSX.Element {
  return (
    <div style={{ padding: '20px', 'text-align': 'center' }}>
      <h2 style={{ color: 'red' }}>Error</h2>
      <p>{props.error.message}</p>
      <button type="button" onClick={props.reset}>
        Retry
      </button>
    </div>
  )
}

// Default loading component
function DefaultLoading(): JSX.Element {
  return <div style={{ padding: '20px', 'text-align': 'center' }}>Loading...</div>
}

// Default 404 component
function NotFound(): JSX.Element {
  return (
    <div style={{ padding: '20px', 'text-align': 'center' }}>
      <h1>404</h1>
      <p>Page not found</p>
      <a href="/">Go home</a>
    </div>
  )
}

interface OutletProps {
  children?: JSX.Element
}

/**
 * Outlet component to render nested content in layouts
 */
export function Outlet(props: OutletProps): JSX.Element {
  return <>{props.children}</>
}

interface FileRoutesProps {
  routes: Map<string, RouteDefinition>
}

/**
 * Internal router view that renders the matched route
 */
export function FileRoutes(props: FileRoutesProps): JSX.Element {
  const router = useRouter()

  const matchedRoute = createMemo(() => {
    const pathname = router.pathname()
    return findMatchingRoute(props.routes, pathname)
  })

  const layouts = createMemo(() => {
    return getLayoutsForPath(props.routes, router.pathname())
  })

  // Build the view by wrapping the page content with layouts (reactive to route changes)
  const view = createMemo(() => {
    const route = matchedRoute()
    const layoutComponents = layouts()

    let content: JSX.Element

    // 1. Render Page
    if (!route || !route.page) {
      content = <NotFound />
    } else {
      const PageComponent = route.page
      const ErrorComponent = route.error || DefaultErrorFallback
      const LoadingComponent = route.loading || DefaultLoading

      content = (
        <ErrorBoundary fallback={(err: Error, reset: () => void) => <ErrorComponent error={err} reset={reset} />}>
          <Suspense fallback={<LoadingComponent />}>
            <PageComponent />
          </Suspense>
        </ErrorBoundary>
      )
    }

    // 2. Wrap with Layouts (Innermost -> Outermost)
    for (let i = layoutComponents.length - 1; i >= 0; i--) {
      const LayoutComponent = layoutComponents[i] as Component<{ children?: JSX.Element }>
      const currentContent = content
      content = (
        <LayoutComponent>
          <Outlet>{currentContent}</Outlet>
        </LayoutComponent>
      )
    }

    return content
  })

  return <>{view()}</>
}

interface FileRouterProps {
  routes: Map<string, RouteDefinition>
  children?: JSX.Element
}

/**
 * Main FileRouter component for file-based routing
 *
 * @example
 * ```tsx
 * import { FileRouter, buildRoutes, RouteModule } from 'inertia-adapter-solid/router'
 *
 * // Import all route modules using Vite's glob import
 * const routeModules = import.meta.glob<RouteModule>(
 *   './routes/** /[+](page|layout|error|loading).tsx',
 *   { eager: true }
 * )
 *
 * const routes = buildRoutes(routeModules)
 *
 * function App() {
 *   return <FileRouter routes={routes} />
 * }
 * ```
 */
export function FileRouter(props: FileRouterProps): JSX.Element {
  return (
    <RouterProvider>
      <FileRoutes routes={props.routes} />
      {props.children}
    </RouterProvider>
  )
}

export default FileRouter
