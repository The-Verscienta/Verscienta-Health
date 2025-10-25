/**
 * FAQ Component
 *
 * Displays Frequently Asked Questions in an accessible accordion format.
 * Supports JSON-LD schema generation for SEO.
 */

'use client'

import * as React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQProps {
  items: FAQItem[]
  defaultValue?: string
  className?: string
}

/**
 * FAQ Component
 *
 * Renders a list of FAQ items in an accordion format.
 *
 * @example
 * ```tsx
 * <FAQ
 *   items={[
 *     {
 *       question: "What is Traditional Chinese Medicine?",
 *       answer: "Traditional Chinese Medicine (TCM) is a comprehensive medical system..."
 *     },
 *     {
 *       question: "How do I use this platform?",
 *       answer: "You can search for herbs, formulas, and practitioners..."
 *     }
 *   ]}
 * />
 * ```
 */
export function FAQ({ items, defaultValue, className }: FAQProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultValue}
      className={cn('w-full', className)}
    >
      {items.map((item, index) => (
        <AccordionItem key={`faq-${index}`} value={`item-${index}`}>
          <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
          <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/**
 * FAQ Section Component
 *
 * Renders a complete FAQ section with title and optional subtitle.
 *
 * @example
 * ```tsx
 * <FAQSection
 *   title="Frequently Asked Questions"
 *   subtitle="Find answers to common questions about our platform"
 *   items={faqItems}
 * />
 * ```
 */
export interface FAQSectionProps extends FAQProps {
  title?: string
  subtitle?: string
}

export function FAQSection({
  title = 'Frequently Asked Questions',
  subtitle,
  items,
  defaultValue,
  className,
}: FAQSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        {title && <h2 className="text-earth-900 mb-2 font-serif text-3xl font-bold">{title}</h2>}
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </div>
      <FAQ items={items} defaultValue={defaultValue} />
    </div>
  )
}
