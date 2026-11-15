import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from '~/plugins/i18n'

export function useLocale() {
  const { locale, availableLocales } = useI18n()

  const currentLocale = computed(() => (locale.value as string) || DEFAULT_LOCALE)

  function setLocale(next: string) {
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(next)) return
    locale.value = next as 'sv'
    if (process.client) {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next)
        document.cookie = `${LOCALE_STORAGE_KEY}=${next};path=/;max-age=31536000;SameSite=Lax`
      } catch {}
      document.documentElement.lang = next
    }
  }

  return { locale: currentLocale, locales: SUPPORTED_LOCALES, availableLocales, setLocale }
}
