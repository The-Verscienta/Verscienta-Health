import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

// Default tabs
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-gray-600">
          Overview information about the herb goes here.
        </p>
      </TabsContent>
      <TabsContent value="properties">
        <p className="text-sm text-gray-600">
          Medicinal properties and benefits of the herb.
        </p>
      </TabsContent>
      <TabsContent value="usage">
        <p className="text-sm text-gray-600">
          Instructions on how to use this herb effectively.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

// With cards
export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input className="w-full rounded-md border px-3 py-2" defaultValue="John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input className="w-full rounded-md border px-3 py-2" defaultValue="john@example.com" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <input type="password" className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">New Password</label>
              <input type="password" className="w-full rounded-md border px-3 py-2" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
}

// Herb details example
export const HerbDetails: Story = {
  render: () => (
    <Tabs defaultValue="benefits" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="benefits">Benefits</TabsTrigger>
        <TabsTrigger value="dosage">Dosage</TabsTrigger>
        <TabsTrigger value="cautions">Cautions</TabsTrigger>
        <TabsTrigger value="research">Research</TabsTrigger>
      </TabsList>
      <TabsContent value="benefits" className="space-y-2">
        <h3 className="font-semibold">Health Benefits</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Boosts immune system function</li>
          <li>Reduces inflammation</li>
          <li>Improves cognitive function</li>
          <li>Supports cardiovascular health</li>
        </ul>
      </TabsContent>
      <TabsContent value="dosage" className="space-y-2">
        <h3 className="font-semibold">Recommended Dosage</h3>
        <p className="text-sm text-gray-600">
          Adults: 1-2 grams per day of dried root, or 200-400mg of extract.
        </p>
        <p className="text-sm text-gray-600">
          Best taken in the morning or early afternoon. Consult a healthcare provider for personalized dosing.
        </p>
      </TabsContent>
      <TabsContent value="cautions" className="space-y-2">
        <h3 className="font-semibold">Cautions & Contraindications</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Not recommended during pregnancy or breastfeeding</li>
          <li>May interact with blood pressure medications</li>
          <li>Avoid if you have autoimmune conditions</li>
          <li>Stop use 2 weeks before surgery</li>
        </ul>
      </TabsContent>
      <TabsContent value="research" className="space-y-2">
        <h3 className="font-semibold">Scientific Research</h3>
        <p className="text-sm text-gray-600">
          Multiple studies have demonstrated the efficacy of this herb in clinical trials.
          Recent meta-analysis shows positive results for immune support.
        </p>
        <p className="text-sm text-gray-600 italic">
          Note: Consult peer-reviewed journals for detailed research findings.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

// Controlled tabs
export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('tab1')

    return (
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content for tab 1</TabsContent>
          <TabsContent value="tab2">Content for tab 2</TabsContent>
          <TabsContent value="tab3">Content for tab 3</TabsContent>
        </Tabs>
        <p className="text-sm text-gray-600">
          Active tab: <strong>{activeTab}</strong>
        </p>
      </div>
    )
  },
}

// Disabled tab
export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="available" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="available">Available</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="also-available">Also Available</TabsTrigger>
      </TabsList>
      <TabsContent value="available">
        This tab is available and can be clicked.
      </TabsContent>
      <TabsContent value="disabled">
        This content won't be shown since the tab is disabled.
      </TabsContent>
      <TabsContent value="also-available">
        This tab is also available.
      </TabsContent>
    </Tabs>
  ),
}

// Full width tabs
export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-full max-w-[600px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All Herbs</TabsTrigger>
        <TabsTrigger value="favorites">Favorites</TabsTrigger>
        <TabsTrigger value="recent">Recent</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-gray-600">Showing all herbs in the database.</p>
      </TabsContent>
      <TabsContent value="favorites">
        <p className="text-sm text-gray-600">Your favorite herbs appear here.</p>
      </TabsContent>
      <TabsContent value="recent">
        <p className="text-sm text-gray-600">Recently viewed herbs.</p>
      </TabsContent>
    </Tabs>
  ),
}

// Many tabs (scrollable)
export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList className="overflow-x-auto">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        <TabsTrigger value="tab4">Tab 4</TabsTrigger>
        <TabsTrigger value="tab5">Tab 5</TabsTrigger>
        <TabsTrigger value="tab6">Tab 6</TabsTrigger>
        <TabsTrigger value="tab7">Tab 7</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
      <TabsContent value="tab4">Content 4</TabsContent>
      <TabsContent value="tab5">Content 5</TabsContent>
      <TabsContent value="tab6">Content 6</TabsContent>
      <TabsContent value="tab7">Content 7</TabsContent>
    </Tabs>
  ),
}

// Vertical orientation (custom)
export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="overview" orientation="vertical" className="flex gap-4">
      <TabsList className="flex-col h-auto">
        <TabsTrigger value="overview" className="w-full">
          Overview
        </TabsTrigger>
        <TabsTrigger value="properties" className="w-full">
          Properties
        </TabsTrigger>
        <TabsTrigger value="usage" className="w-full">
          Usage
        </TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="overview">
          <h3 className="font-semibold mb-2">Overview</h3>
          <p className="text-sm text-gray-600">
            General information and introduction to the herb.
          </p>
        </TabsContent>
        <TabsContent value="properties">
          <h3 className="font-semibold mb-2">Properties</h3>
          <p className="text-sm text-gray-600">
            Detailed medicinal properties and active compounds.
          </p>
        </TabsContent>
        <TabsContent value="usage">
          <h3 className="font-semibold mb-2">Usage</h3>
          <p className="text-sm text-gray-600">
            How to prepare and consume this herb safely.
          </p>
        </TabsContent>
      </div>
    </Tabs>
  ),
}

// With icons
export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="info" className="w-[450px]">
      <TabsList>
        <TabsTrigger value="info" className="gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Info
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="info">
        Information and details
      </TabsContent>
      <TabsContent value="settings">
        Settings and preferences
      </TabsContent>
    </Tabs>
  ),
}

// Navigation tabs
export const NavigationStyle: Story = {
  render: () => (
    <Tabs defaultValue="herbs" className="w-[600px]">
      <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none p-0 h-auto">
        <TabsTrigger
          value="herbs"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-earth-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Herbs
        </TabsTrigger>
        <TabsTrigger
          value="formulas"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-earth-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Formulas
        </TabsTrigger>
        <TabsTrigger
          value="conditions"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-earth-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Conditions
        </TabsTrigger>
      </TabsList>
      <TabsContent value="herbs" className="p-4">
        Browse individual herbs and their properties
      </TabsContent>
      <TabsContent value="formulas" className="p-4">
        Explore herbal formulas and combinations
      </TabsContent>
      <TabsContent value="conditions" className="p-4">
        Find herbs and formulas for specific conditions
      </TabsContent>
    </Tabs>
  ),
}
