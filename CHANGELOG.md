# inertia-adapter-solid

## 1.0.0-beta.3

### Minor Changes

- enhancement(router): Add file-based routing support
  - New `FileRouter` component for file-system based routing similar to Next.js/SvelteKit
  - New `RouterProvider` and `RouterLink` components for client-side navigation
  - Route matching utilities: `matchPath`, `filePathToRoutePattern`, `buildRoutes`
  - Support for dynamic routes `[id]` and catch-all routes `[...slug]`
  - Nested layouts with `+layout.tsx` files
  - Error boundaries with `+error.tsx` files
  - Loading states with `+loading.tsx` files
- docs: Add Phoenix framework integration guide (docs/PHOENIX_INTEGRATION.md)

## 1.0.0-beta.2

### Patch Changes

- 848af0b: chore: Bump `@inertiajs/core` to v2.2.11

## 1.0.0-beta.1

### Patch Changes

- 0df24d7: bug: Fix typings for dynamic components (InfiniteScroll, Link, WhenVisible)

## 1.0.0-beta.0

### Major Changes

- 563e9f6: enhancement: Upgrade @inertiajs/core to v2
- bf07e97: enhancement(components): Implement `<WhenVisible />` component
- 7f97fa5: enhancement(components): Implement `<Deferred />` component
- 7f97fa5: enhancement(util): Implement `usePoll()` utility
- 7f97fa5: enhancement(util): Implement `usePrefetch()` utility
- da1488a: enhancement: Upgrade implementation of `<Link />` and `useForm()` for Inertia v2
- 7b1f079: enhancement(components): Implement `<Form />` component
- 337dea3: enhancement(components): Implement `<InfiniteScroll />` component

## 0.3.1

### Patch Changes

- 59c03ba: fix(deps): Fix @solid-primitives/deep dependency placement
