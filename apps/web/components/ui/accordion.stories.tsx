import type { Meta, StoryObj } from '@storybook/react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

// Single open (default behavior)
export const SingleOpen: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[500px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Traditional Chinese Medicine?</AccordionTrigger>
        <AccordionContent>
          Traditional Chinese Medicine (TCM) is a holistic healing system that has been practiced
          for thousands of years. It focuses on balancing the body's energy (Qi) and includes
          herbal medicine, acupuncture, and dietary therapy.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do Chinese herbs work?</AccordionTrigger>
        <AccordionContent>
          Chinese herbs work by targeting specific organs and meridian systems to restore balance.
          They can tonify deficiencies, clear excesses, and harmonize the body's natural functions.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Are Chinese herbs safe?</AccordionTrigger>
        <AccordionContent>
          When prescribed by a qualified practitioner and sourced from reputable suppliers, Chinese
          herbs are generally safe. However, it's important to consult with a healthcare provider
          before starting any herbal regimen.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Multiple open
export const MultipleOpen: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[500px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Shipping Information</AccordionTrigger>
        <AccordionContent>
          We offer free shipping on orders over $50. Standard shipping takes 3-5 business days,
          while express shipping is available for 1-2 business days.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Return Policy</AccordionTrigger>
        <AccordionContent>
          You can return unused products within 30 days of purchase for a full refund. Please keep
          the original packaging and receipt.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Customer Support</AccordionTrigger>
        <AccordionContent>
          Our customer support team is available Monday-Friday, 9am-5pm PST. You can reach us by
          email at support@verscienta.com or call us at 1-800-HERBS-4U.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Default expanded
export const DefaultExpanded: Story = {
  render: () => (
    <Accordion type="single" defaultValue="item-1" collapsible className="w-[500px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Getting Started</AccordionTrigger>
        <AccordionContent>
          This section is expanded by default. Click to collapse it or expand other sections.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Advanced Features</AccordionTrigger>
        <AccordionContent>
          Explore advanced features like custom formulas and symptom tracking.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Herb details FAQ
export const HerbDetailsFAQ: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[600px]">
      <AccordionItem value="benefits">
        <AccordionTrigger>What are the health benefits?</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Boosts immune system function</li>
            <li>Reduces inflammation and oxidative stress</li>
            <li>Improves cognitive function and mental clarity</li>
            <li>Supports cardiovascular health</li>
            <li>Enhances energy and reduces fatigue</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="dosage">
        <AccordionTrigger>What is the recommended dosage?</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-gray-600">
            <p>
              <strong>Adults:</strong> 1-2 grams of dried root per day, or 200-400mg of extract.
            </p>
            <p>
              <strong>Timing:</strong> Best taken in the morning or early afternoon.
            </p>
            <p className="text-sm italic">
              Consult a healthcare provider for personalized dosing recommendations.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="interactions">
        <AccordionTrigger>Are there any drug interactions?</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-gray-600">
            <p>May interact with:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Blood pressure medications</li>
              <li>Blood thinners (warfarin)</li>
              <li>Immunosuppressants</li>
              <li>Diabetes medications</li>
            </ul>
            <p className="text-sm font-semibold text-orange-600 mt-2">
              Always consult your doctor before combining with medications.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="storage">
        <AccordionTrigger>How should I store this herb?</AccordionTrigger>
        <AccordionContent>
          <p className="text-gray-600">
            Store in a cool, dry place away from direct sunlight. Keep the container tightly sealed
            to preserve potency. Properly stored herbs can last 1-2 years.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// With rich content
export const WithRichContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[600px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Ginseng (Panax ginseng)</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <img
              src="https://images.unsplash.com/photo-1607623488235-27e1c82c97f3?w=400"
              alt="Ginseng root"
              className="w-full h-32 object-cover rounded"
            />
            <p className="text-gray-600">
              Ginseng is one of the most revered herbs in Traditional Chinese Medicine, known for
              its adaptogenic properties and ability to increase vitality.
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                Adaptogen
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                Energy Booster
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Astragalus (Huang Qi)</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p className="text-gray-600">
              Astragalus is a foundational herb in TCM, primarily used to tonify Qi and strengthen
              the immune system.
            </p>
            <div className="bg-amber-50 p-3 rounded border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>TCM Properties:</strong> Sweet, slightly warm. Enters Lung and Spleen
                meridians.
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Formula details
export const FormulaDetails: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[600px]">
      <AccordionItem value="ingredients">
        <AccordionTrigger>Formula Ingredients</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b">
              <span>Ginseng (Ren Shen)</span>
              <span className="text-gray-500">9g</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Astragalus (Huang Qi)</span>
              <span className="text-gray-500">15g</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Licorice (Gan Cao)</span>
              <span className="text-gray-500">6g</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Jujube (Da Zao)</span>
              <span className="text-gray-500">10 pieces</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="preparation">
        <AccordionTrigger>Preparation Method</AccordionTrigger>
        <AccordionContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Rinse all herbs briefly with water</li>
            <li>Add herbs to 4 cups of water in a ceramic or glass pot</li>
            <li>Bring to a boil, then reduce heat and simmer for 30-40 minutes</li>
            <li>Strain and divide into 2 doses</li>
            <li>Drink warm, twice daily (morning and evening)</li>
          </ol>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="indications">
        <AccordionTrigger>Traditional Indications</AccordionTrigger>
        <AccordionContent>
          <p className="text-gray-600 mb-2">
            This formula is traditionally used for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Qi deficiency with fatigue</li>
            <li>Poor appetite and digestive weakness</li>
            <li>Shortness of breath and weak voice</li>
            <li>Spontaneous sweating</li>
            <li>Recovery from illness</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Compact version
export const Compact: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1" className="border-b-0">
        <AccordionTrigger className="py-2 text-sm">Question 1</AccordionTrigger>
        <AccordionContent className="text-sm">
          Short answer to question 1.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="border-b-0">
        <AccordionTrigger className="py-2 text-sm">Question 2</AccordionTrigger>
        <AccordionContent className="text-sm">
          Short answer to question 2.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" className="border-b-0">
        <AccordionTrigger className="py-2 text-sm">Question 3</AccordionTrigger>
        <AccordionContent className="text-sm">
          Short answer to question 3.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Disabled item
export const WithDisabledItem: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[500px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Available Section</AccordionTrigger>
        <AccordionContent>
          This section is available and can be expanded.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger className="opacity-50 cursor-not-allowed">
          Coming Soon (Disabled)
        </AccordionTrigger>
        <AccordionContent>
          This content is not yet available.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Another Available Section</AccordionTrigger>
        <AccordionContent>
          This section is also available.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
