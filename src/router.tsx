import { lazy } from 'react'
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const WorkoutsPage = lazy(() => import('@/pages/WorkoutsPage').then(m => ({ default: m.WorkoutsPage })))
const ProgressPage = lazy(() => import('@/pages/ProgressPage').then(m => ({ default: m.ProgressPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))

const rootRoute = createRootRoute({
  component: AppShell,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const workoutsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workouts',
  component: WorkoutsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    workoutId: (search.workoutId as string) ?? undefined,
  }),
})

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/progress',
  component: ProgressPage,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  workoutsRoute,
  progressRoute,
  profileRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
