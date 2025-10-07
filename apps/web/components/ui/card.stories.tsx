import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a simple card with just a title and content.</p>
      </CardContent>
    </Card>
  ),
}

export const WithBadges: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>Ginseng (人参)</CardTitle>
          <Badge variant="gold">Verified</Badge>
        </div>
        <CardDescription>Panax ginseng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="tcm">Warming</Badge>
          <Badge variant="sage">Sweet</Badge>
          <Badge variant="sage">Bitter</Badge>
        </div>
        <p className="text-sm text-gray-600">
          A powerful adaptogen used in Traditional Chinese Medicine to boost energy and cognitive
          function.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  ),
}

export const HerbCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Astragalus Root</CardTitle>
            <CardDescription>Astragalus membranaceus (黄芪)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="tcm">Warming</Badge>
            <Badge variant="sage">Sweet</Badge>
            <Badge variant="gold">Spleen</Badge>
            <Badge variant="gold">Lung</Badge>
          </div>
          <p className="text-sm text-gray-700">
            Tonifies Qi and strengthens the immune system. Used for fatigue, weakness, and to
            protect against illness.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>TCM Functions:</span>
            <span className="font-medium">Qi Tonic, Immune Support</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1">
          Save
        </Button>
        <Button className="flex-1">Learn More</Button>
      </CardFooter>
    </Card>
  ),
}

export const PractitionerCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="bg-earth-200 text-earth-700 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
            JD
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Dr. Jane Doe</CardTitle>
              <Badge variant="gold">Verified</Badge>
            </div>
            <CardDescription>Licensed Acupuncturist, Herbalist</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="sage">Acupuncture</Badge>
            <Badge variant="sage">Herbal Medicine</Badge>
            <Badge variant="sage">Cupping</Badge>
          </div>
          <p className="text-sm text-gray-600">
            15 years of experience in Traditional Chinese Medicine. Specializing in pain management
            and digestive health.
          </p>
          <p className="text-sm text-gray-500">📍 San Francisco, CA</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Book Consultation</Button>
      </CardFooter>
    </Card>
  ),
}

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Card 1</CardTitle>
          <CardDescription>First card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for the first card.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Card 2</CardTitle>
          <CardDescription>Second card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for the second card.</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}
