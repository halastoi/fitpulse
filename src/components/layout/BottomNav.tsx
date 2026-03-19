import { useLocation, useNavigate } from '@tanstack/react-router'
import { useI18n } from '@/i18n/useI18n'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()

  const navItems = [
    { path: '/', label: t('nav_home'), icon: '🏠' },
    { path: '/workouts', label: t('nav_workouts'), icon: '💪' },
    { path: '/progress', label: t('nav_progress'), icon: '📊' },
    { path: '/profile', label: t('nav_profile'), icon: '👤' },
  ] as const

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-lg z-50 safe-area-pb"
      style={{ backgroundColor: 'var(--nav-bg)', borderTop: '1px solid var(--surface-border)' }}
    >
      <div className="max-w-lg mx-auto flex">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path } as never)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-3 transition-colors ${
                isActive ? 'text-primary-400' : ''
              }`}
              style={!isActive ? { color: 'var(--text-muted)' } : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
