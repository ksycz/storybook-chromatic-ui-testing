import type { Preview } from '@storybook/react-vite'
import '../src/styles/tokens.css'
import '../src/styles/global.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    a11y: {
      // fail the Vitest run (and CI) on any axe violation
      test: 'error',
    },
  },
}

export default preview
