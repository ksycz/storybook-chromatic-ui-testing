import { availability } from './availability'
import type { Workshop } from './workshops'

export type BookingInput = { name: string; email: string; workshopId: string }
export type BookingErrors = Partial<Record<keyof BookingInput, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateBooking(input: BookingInput, list: Workshop[]): BookingErrors {
  const errors: BookingErrors = {}
  const name = input.name.trim()
  const email = input.email.trim()

  if (!name) errors.name = 'Name is required'

  if (!email) errors.email = 'Email is required'
  else if (!EMAIL.test(email)) errors.email = 'Enter a valid email'

  const workshop = list.find((w) => w.id === input.workshopId)
  if (!workshop) errors.workshopId = 'Choose a workshop'
  else if (availability(workshop.seatsLeft) === 'soldOut') {
    errors.workshopId = 'This workshop is sold out'
  }

  return errors
}
