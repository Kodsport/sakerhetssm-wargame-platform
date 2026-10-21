import { createI18n } from 'vue-i18n'
import sv from '~/i18n/locales/sv.json'

export const SUPPORTED_LOCALES = ['sv'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = 'sv'
export const LOCALE_STORAGE_KEY = 'ssm-locale'

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: DEFAULT_LOCALE,
    fallbackLocale: DEFAULT_LOCALE,
    messages: { sv },
  })

  nuxtApp.vueApp.use(i18n)

  if (process.client) {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored === 'sv') {
        i18n.global.locale.value = stored as SupportedLocale
      } else {
        i18n.global.locale.value = DEFAULT_LOCALE
      }
    } catch {}
    const syncHtmlLang = (locale: string) => {
      document.documentElement.lang = locale
    }
    syncHtmlLang(i18n.global.locale.value as string)
    watch(i18n.global.locale, (locale) => syncHtmlLang(locale as string))
  } else {
    const locale = (i18n.global.locale.value as string) || DEFAULT_LOCALE
    useHead({ htmlAttrs: { lang: locale } })
  }
})
