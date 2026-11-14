import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { Modal } from './Modal'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Booking confirmed',
    onClose: fn(),
    children: 'Your confirmation number is BK-visual-testing.',
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    // The dialog opens in an effect right after the first render, so wait for it instead of expecting it at once.
    const dialog = await within(canvasElement).findByRole('dialog', { name: 'Booking confirmed' })
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus())
    await userEvent.keyboard('{Escape}')
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}
