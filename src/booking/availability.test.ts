import { describe, expect, it } from 'vitest'
import { availability } from './availability'

describe('availability', () => {
  it('is soldOut at 0 seats', () => expect(availability(0)).toBe('soldOut'))
  it('is few at 1 seat', () => expect(availability(1)).toBe('few'))
  it('is few at 3 seats', () => expect(availability(3)).toBe('few'))
  it('is available at 4 seats', () => expect(availability(4)).toBe('available'))
})
