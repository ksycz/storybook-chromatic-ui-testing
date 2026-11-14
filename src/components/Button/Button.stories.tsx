import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Book', onClick: fn() },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Book' }))
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const Secondary: Story = { args: { variant: 'secondary' } }

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Book' })
    await expect(button).toBeDisabled()
    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

export const Loading: Story = {
  args: { loading: true, children: 'Book my seat' },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Booking…' })
    await expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}
