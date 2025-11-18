import type { Meta, StoryObj } from '@storybook/react'
import { MoreVertical, User, Settings, LogOut, Mail, MessageSquare, Plus, Archive, Trash2, Star, Download } from 'lucide-react'
import { Button } from './button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'

const meta = {
  title: 'UI/Dropdown Menu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

// Basic dropdown
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// With icons
export const WithIcons: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 h-4 w-4" />
          Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Mail className="mr-2 h-4 w-4" />
          <span>Messages</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// Icon button trigger
export const IconButton: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// Herb card actions
export const HerbCardActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Herb actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Star className="mr-2 h-4 w-4" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Add Note</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          <span>Export Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Archive className="mr-2 h-4 w-4" />
          <span>Archive</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// With disabled item
export const WithDisabled: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem disabled>Share (Coming soon)</DropdownMenuItem>
        <DropdownMenuItem>Download</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// Destructive action
export const DestructiveAction: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Manage</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Archive className="mr-2 h-4 w-4" />
          <span>Archive</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// User menu
export const UserMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-earth-600 text-white">
            JD
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
        <div className="h-px bg-gray-200 my-1" />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <div className="h-px bg-gray-200 my-1" />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// Align options
export const AlignEnd: Story = {
  render: () => (
    <div className="flex justify-end w-96">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Aligned End</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Option 1</DropdownMenuItem>
          <DropdownMenuItem>Option 2</DropdownMenuItem>
          <DropdownMenuItem>Option 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
}

// Side offset
export const CustomSideOffset: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Large Offset</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={20}>
        <DropdownMenuItem>Option 1</DropdownMenuItem>
        <DropdownMenuItem>Option 2</DropdownMenuItem>
        <DropdownMenuItem>Option 3</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// Wide menu
export const WideMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Wide Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuItem>
          <div>
            <div className="font-medium">New Herb Entry</div>
            <div className="text-xs text-gray-500">Add a new herb to your collection</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div>
            <div className="font-medium">New Formula</div>
            <div className="text-xs text-gray-500">Create a custom herbal formula</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div>
            <div className="font-medium">Import Data</div>
            <div className="text-xs text-gray-500">Import herbs from CSV or JSON</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

// Create new menu
export const CreateNewMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>New Herb</DropdownMenuItem>
        <DropdownMenuItem>New Formula</DropdownMenuItem>
        <DropdownMenuItem>New Condition</DropdownMenuItem>
        <DropdownMenuItem>New Collection</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
