import { Suspense } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useI18n } from '@/i18n/useI18n'
import { BottomNav } from './BottomNav'
import { RadioFloatingButton, RadioPanel } from '@/components/ui/RadioPlayer'
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt'

function PageLoader() {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-center min-h-[60svh]">
      <div className="animate-pulse text-primary-400 text-lg">{t('loading')}</div>
    </div>
  )
}

export function AppShell() {
  return (
    <div className="flex flex-col min-h-svh">
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
      <RadioFloatingButton />
      <RadioPanel />
      <PWAInstallPrompt />
    </div>
  )
}
