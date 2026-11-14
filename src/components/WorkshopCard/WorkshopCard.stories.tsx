import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { workshops } from '../../booking'
import { WorkshopCard } from './WorkshopCard'

const [available, fewSeats, soldOut] = workshops

const meta = {
  title: 'Components/WorkshopCard',
  component: WorkshopCard,
  args: { workshop: available, onBook: fn() },
} satisfies Meta<typeof WorkshopCard>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Book' }))
    await expect(args.onBook).toHaveBeenCalledWith('visual-testing')
  },
}

export const FewSeats: Story = { args: { workshop: fewSeats } }

export const SoldOut: Story = {
  args: { workshop: soldOut },
  play: async ({ canvasElement, args }) => {
    const book = within(canvasElement).getByRole('button', { name: 'Book' })
    await expect(book).toBeDisabled()
    await userEvent.click(book)
    await expect(args.onBook).not.toHaveBeenCalled()
  },
}
