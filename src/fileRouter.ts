// Re-export router utilities
export {
  RouterProvider,
  RouterLink,
  useRouter,
  usePathname,
  useParams,
  useSearchParams,
  matchPath,
  filePathToRoutePattern,
  type RouteMatch,
  type RouteModule,
  type RouterContextValue,
} from './router/index.jsx'

// Re-export FileRouter components
export {
  FileRouter,
  FileRoutes,
  Outlet,
  buildRoutes,
  findMatchingRoute,
  getLayoutsForPath,
  type ErrorFallbackProps,
  type ErrorComponent,
  type RouteDefinition,
  type RouteModules,
} from './router/FileRouter.jsx'
