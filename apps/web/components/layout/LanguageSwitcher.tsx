'use client'

import { GlobeIcon } from 'lucide-react'
import { useLocale } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Locale, locales } from '@/i18n/request'
import { usePathname, useRouter } from '@/i18n/routing'

const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
}

const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇹🇼',
}

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (locale: Locale) => {
    // next-intl's router.replace handles locale switching automatically
    router.replace(pathname, { locale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:bg-earth-50 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors">
        <GlobeIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
        <span className="hidden md:inline">{localeNames[currentLocale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={currentLocale === locale ? 'bg-earth-50 font-semibold' : ''}
          >
            <span className="mr-2">{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
