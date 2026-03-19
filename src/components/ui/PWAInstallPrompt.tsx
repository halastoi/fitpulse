import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useI18n } from '@/i18n/useI18n'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    const dismissed = localStorage.getItem('fp-pwa-dismissed')
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowBanner(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('fp-pwa-dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto rounded-2xl p-4 shadow-xl"
          style={{
            backgroundColor: 'var(--nav-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--surface-border)',
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
              FP
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {t('pwa_install_title')}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('pwa_install_desc')}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleDismiss}
                className="text-xs px-3 py-2 rounded-lg font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {t('pwa_later')}
              </button>
              <button
                onClick={handleInstall}
                className="text-xs px-4 py-2 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-500 transition-colors"
              >
                {t('pwa_install_btn')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
