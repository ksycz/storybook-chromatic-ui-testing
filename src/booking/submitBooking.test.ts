import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitBooking } from './submitBooking'

describe('submitBooking', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('resolves with a confirmation id after 300 ms', async () => {
    const pending = submitBooking({
      name: 'Kasia',
      email: 'kasia@example.com',
      workshopId: 'visual-testing',
    })
    let settled = false
    pending.then(() => (settled = true))
    await vi.advanceTimersByTimeAsync(299)
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await expect(pending).resolves.toEqual({ confirmationId: 'BK-visual-testing' })
  })
})
