import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { TextField } from './TextField'

type Props = React.ComponentProps<typeof TextField>

// Keeps its own value so typing works like in the real form.
function Controlled(props: Props) {
  const [value, setValue] = useState(props.value)
  return (
    <TextField
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next)
        props.onChange(next)
      }}
    />
  )
}

const meta = {
  title: 'Components/TextField',
  component: TextField,
  args: { label: 'Name', name: 'name', value: '', onChange: fn() },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.type(within(canvasElement).getByLabelText('Name'), 'Kasia')
    await expect(args.onChange).toHaveBeenLastCalledWith('Kasia')
  },
}

export const Filled: Story = { args: { value: 'Kasia' } }

export const WithError: Story = {
  args: { error: 'Name is required' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Name')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAccessibleDescription('Name is required')
  },
}

export const Disabled: Story = { args: { disabled: true, value: 'Kasia' } }
