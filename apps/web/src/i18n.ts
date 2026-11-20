import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { catalogs, defaultLocale } from '@/locales/catalogs'

export const i18n = i18next.createInstance()

void i18n.use(initReactI18next).init({
  resources: {
    pl: { translation: catalogs.pl },
  },
  lng: defaultLocale,
  interpolation: { escapeValue: false },
})
