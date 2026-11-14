import type { BookingInput } from './validateBooking'

export function submitBooking(input: BookingInput): Promise<{ confirmationId: string }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ confirmationId: 'BK-' + input.workshopId }), 300)
  })
}
