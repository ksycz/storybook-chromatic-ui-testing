import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Badge } from './Badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {
  args: { seatsLeft: 8 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('8 seats left')).toBeVisible()
  },
}

export const FewSeats: Story = {
  args: { seatsLeft: 2 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Only 2 seats left')).toBeVisible()
  },
}

export const SoldOut: Story = {
  args: { seatsLeft: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Sold out')).toBeVisible()
  },
}
