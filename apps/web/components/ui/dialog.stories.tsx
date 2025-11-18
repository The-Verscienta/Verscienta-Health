import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Input } from './input'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

// Basic dialog
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a simple dialog with a title and description.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
}

// With actions
export const WithActions: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Delete Herb</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the herb from your collection.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Form dialog
export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New Herb</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Herb</DialogTitle>
          <DialogDescription>
            Enter the details of the herb you want to add to your collection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Herb Name
            </label>
            <Input id="name" placeholder="e.g., Ginseng" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="latin" className="text-sm font-medium">
              Latin Name
            </label>
            <Input id="latin" placeholder="e.g., Panax ginseng" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="properties" className="text-sm font-medium">
              Properties
            </label>
            <Input id="properties" placeholder="e.g., Adaptogenic, Energizing" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Save Herb</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Confirmation dialog
export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action is permanent and cannot be
            undone. All your data will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">No, keep my account</Button>
          <Button variant="destructive">Yes, delete my account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Info dialog
export const InfoDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Learn More</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Traditional Chinese Medicine</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Traditional Chinese Medicine (TCM) is a holistic healing system that has been
              practiced for thousands of years.
            </p>
            <p>
              It focuses on balancing the body's energy (Qi) and uses various methods including
              herbal medicine, acupuncture, and dietary therapy.
            </p>
            <p>
              TCM views health as a state of harmony between opposing forces like yin and yang, and
              treatment aims to restore this balance.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Success dialog
export const SuccessDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Submit Order</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-green-600">Order Successful!</DialogTitle>
          <DialogDescription>
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <DialogFooter>
          <Button>View Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Long content dialog
export const LongContentDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Terms</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>Please read these terms carefully before using our service.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold">1. Acceptance of Terms</h3>
            <p className="text-gray-600">
              By accessing and using this service, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">2. Use License</h3>
            <p className="text-gray-600">
              Permission is granted to temporarily download one copy of the materials on Verscienta
              Health's website for personal, non-commercial transitory viewing only.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">3. Disclaimer</h3>
            <p className="text-gray-600">
              The materials on Verscienta Health's website are provided on an 'as is' basis.
              Verscienta Health makes no warranties, expressed or implied, and hereby disclaims and
              negates all other warranties including, without limitation, implied warranties or
              conditions of merchantability, fitness for a particular purpose, or non-infringement
              of intellectual property or other violation of rights.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">4. Limitations</h3>
            <p className="text-gray-600">
              In no event shall Verscienta Health or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on Verscienta
              Health's website.
            </p>
          </section>
        </div>
        <DialogFooter>
          <Button variant="outline">Decline</Button>
          <Button>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Custom width
export const CustomWidth: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Wide Dialog</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Wide Dialog</DialogTitle>
          <DialogDescription>
            This dialog has a custom maximum width of 768px (max-w-3xl).
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <h4 className="font-semibold mb-2">Column 1</h4>
            <p className="text-sm text-gray-600">
              Content in the first column. This layout works well for wider dialogs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Column 2</h4>
            <p className="text-sm text-gray-600">
              Content in the second column. You can use this for comparisons or side-by-side info.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ),
}

// No description
export const NoDescription: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Simple Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Just a Title</DialogTitle>
        </DialogHeader>
        <p className="text-sm">This dialog doesn't use DialogDescription component.</p>
      </DialogContent>
    </Dialog>
  ),
}

// Stacked dialogs warning
export const StackedDialogsWarning: Story = {
  render: () => (
    <div className="space-y-4 text-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open First Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>First Dialog</DialogTitle>
            <DialogDescription>
              Note: Radix Dialog does not support nested/stacked dialogs by design. Opening another
              dialog will close this one.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-gray-600">
        ⚠️ Avoid opening dialogs from within dialogs. Use a multi-step flow instead.
      </p>
    </div>
  ),
}
