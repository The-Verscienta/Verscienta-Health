import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)',
    '../app/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../next.config.ts',
    },
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    // Remove Sentry webpack plugin to avoid conflicts with Storybook
    if (config.plugins) {
      config.plugins = config.plugins.filter(
        (plugin) => plugin?.constructor.name !== 'SentryWebpackPlugin'
      )
    }
    return config
  },
}

export default config
