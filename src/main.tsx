import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { seedDatabase } from './db/seed'
import { useThemeStore } from './stores/useThemeStore'
import { useI18n } from './i18n/useI18n'
import './index.css'

// Initialize theme and locale
useThemeStore.getState().init()
document.documentElement.lang = useI18n.getState().locale

seedDatabase().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
})
