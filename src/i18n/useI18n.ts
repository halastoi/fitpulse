import { create } from 'zustand'
import { translations, type Locale, type TranslationKey } from './translations'

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

export const useI18n = create<I18nState>((set, get) => ({
  locale: (localStorage.getItem('fp-locale') as Locale) ?? 'en',

  setLocale: (locale: Locale) => {
    localStorage.setItem('fp-locale', locale)
    document.documentElement.lang = locale
    set({ locale })
  },

  t: (key, params) => {
    const { locale } = get()
    let text = translations[locale]?.[key] ?? translations.en[key] ?? key

    if (params) {
      // Handle plural: "1 day|2 days" pattern
      if (text.includes('|') && params.count !== undefined) {
        const [singular, plural] = text.split('|')
        text = Number(params.count) === 1 ? singular : plural
      }

      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }

    return text
  },
}))
