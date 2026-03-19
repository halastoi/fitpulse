import { create } from 'zustand'

type Theme = 'dark' | 'light' | 'system'

interface ThemeState {
  theme: Theme
  resolved: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  init: () => void
}

function getResolved(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(resolved: 'dark' | 'light') {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(resolved)
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    resolved === 'dark' ? '#6366f1' : '#818cf8',
  )
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('fp-theme') as Theme) ?? 'dark',
  resolved: 'dark',

  setTheme: (theme: Theme) => {
    localStorage.setItem('fp-theme', theme)
    const resolved = getResolved(theme)
    applyTheme(resolved)
    set({ theme, resolved })
  },

  init: () => {
    const { theme } = get()
    const resolved = getResolved(theme)
    applyTheme(resolved)
    set({ resolved })

    if (theme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const { theme: current } = get()
        if (current === 'system') {
          const r = getResolved('system')
          applyTheme(r)
          set({ resolved: r })
        }
      })
    }
  },
}))
