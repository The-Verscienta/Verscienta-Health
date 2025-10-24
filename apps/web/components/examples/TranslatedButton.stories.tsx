/**
 * Example Storybook story demonstrating next-intl integration
 *
 * This story shows how to create internationalized components for Storybook.
 * Use the locale switcher in the Storybook toolbar to see translations in action.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from 'next-intl'
import { Button } from '../ui/button'

// Example component using next-intl
function TranslatedButton({ variant = 'default' }: { variant?: 'default' | 'secondary' }) {
  const t = useTranslations('common')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Internationalized Buttons</h2>
      <div className="flex gap-2">
        <Button variant={variant}>{t('save')}</Button>
        <Button variant="secondary">{t('cancel')}</Button>
        <Button variant="outline">{t('delete')}</Button>
      </div>
    </div>
  )
}

const meta = {
  title: 'Examples/Translated Button',
  component: TranslatedButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Example component demonstrating next-intl integration. Use the locale switcher in the toolbar (globe icon) to change languages.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary'],
      description: 'Button variant',
    },
  },
} satisfies Meta<typeof TranslatedButton>

export default meta
type Story = StoryObj<typeof meta>

// Default story (English)
export const Default: Story = {
  args: {
    variant: 'default',
  },
}

// Spanish locale example
export const Spanish: Story = {
  args: {
    variant: 'default',
  },
  parameters: {
    locale: 'es',
  },
}

// Chinese locale example
export const SimplifiedChinese: Story = {
  args: {
    variant: 'default',
  },
  parameters: {
    locale: 'zh-CN',
  },
}

// Example with different variant
export const SecondaryVariant: Story = {
  args: {
    variant: 'secondary',
  },
}

// Complex example with multiple namespaces
function ComplexTranslatedComponent() {
  const commonT = useTranslations('common')
  const navT = useTranslations('nav')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Multiple Namespaces</h1>
      <div className="space-y-2">
        <p>
          <strong>Common:</strong> {commonT('save')} | {commonT('cancel')}
        </p>
        <p>
          <strong>Navigation:</strong> {navT('home')} | {navT('herbs')} | {navT('formulas')}
        </p>
      </div>
      <div className="flex gap-2">
        <Button>{commonT('save')}</Button>
        <Button variant="secondary">{commonT('cancel')}</Button>
      </div>
    </div>
  )
}

export const MultipleNamespaces: Story = {
  render: () => <ComplexTranslatedComponent />,
}
