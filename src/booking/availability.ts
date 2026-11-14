export type Availability = 'available' | 'few' | 'soldOut'

export function availability(seatsLeft: number): Availability {
  if (seatsLeft <= 0) return 'soldOut'
  if (seatsLeft <= 3) return 'few'
  return 'available'
}
