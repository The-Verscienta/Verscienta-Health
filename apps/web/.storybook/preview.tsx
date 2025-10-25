import type { Preview } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import '../app/globals.css'

// Import all locale messages
import enMessages from '../messages/en.json'
import esMessages from '../messages/es.json'
import zhCNMessages from '../messages/zh-CN.json'
import zhTWMessages from '../messages/zh-TW.json'

// Locale configuration
const locales = ['en', 'es', 'zh-CN', 'zh-TW'] as const
const localeNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
}

// Messages map
const messages = {
  en: enMessages,
  es: esMessages,
  'zh-CN': zhCNMessages,
  'zh-TW': zhTWMessages,
}

const preview: Preview = {
  // Global parameters
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'earth',
          value: '#f5f3ef',
        },
      ],
    },
    // next-intl locale configuration
    locale: 'en',
    locales: {
      en: localeNames.en,
      es: localeNames.es,
      'zh-CN': localeNames['zh-CN'],
      'zh-TW': localeNames['zh-TW'],
    },
  },

  // Global decorators
  decorators: [
    (Story, context) => {
      // Get locale from Storybook toolbar or default to 'en'
      const locale = context.globals.locale || 'en'

      return (
        <NextIntlClientProvider
          locale={locale}
          messages={messages[locale as keyof typeof messages]}
        >
          <Story />
        </NextIntlClientProvider>
      )
    },
  ],

  // Toolbar configuration for locale switching
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: locales.map((locale) => ({
          value: locale,
          title: localeNames[locale],
        })),
        showName: true,
        dynamicTitle: true,
      },
    },
  },
}

export default preview
