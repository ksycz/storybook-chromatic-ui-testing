import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, within } from 'storybook/test'
import { Select } from './Select'

const options = [
  { value: 'visual-testing', label: 'Intro to Visual Testing' },
  { value: 'storybook-for-testers', label: 'Storybook for Testers' },
  { value: 'a11y-basics', label: 'Accessibility Basics (sold out)', disabled: true },
]

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Workshop',
    name: 'workshop',
    value: '',
    placeholder: 'Choose a workshop',
    options,
    onChange: fn(),
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = { args: { value: 'storybook-for-testers' } }

export const WithError: Story = {
  args: { error: 'Choose a workshop' },
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText('Workshop')
    await expect(select).toHaveAttribute('aria-invalid', 'true')
    await expect(select).toHaveAccessibleDescription('Choose a workshop')
  },
}

export const WithSoldOutOption: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('option', { name: 'Accessibility Basics (sold out)' }),
    ).toBeDisabled()
  },
}
