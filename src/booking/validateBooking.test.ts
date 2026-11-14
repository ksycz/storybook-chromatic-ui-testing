import { describe, expect, it } from 'vitest'
import { validateBooking } from './validateBooking'
import { workshops } from './workshops'

const valid = { name: 'Kasia', email: 'kasia@example.com', workshopId: 'visual-testing' }

describe('validateBooking', () => {
  it('reports every missing field on empty input', () => {
    expect(validateBooking({ name: '', email: '', workshopId: '' }, workshops)).toEqual({
      name: 'Name is required',
      email: 'Email is required',
      workshopId: 'Choose a workshop',
    })
  })

  it('rejects a malformed email', () => {
    expect(validateBooking({ ...valid, email: 'nope' }, workshops)).toEqual({
      email: 'Enter a valid email',
    })
  })

  it('rejects a sold-out workshop even if forced', () => {
    expect(validateBooking({ ...valid, workshopId: 'a11y-basics' }, workshops)).toEqual({
      workshopId: 'This workshop is sold out',
    })
  })

  it('rejects an unknown workshop id', () => {
    expect(validateBooking({ ...valid, workshopId: 'unknown' }, workshops)).toEqual({
      workshopId: 'Choose a workshop',
    })
  })

  it('accepts input with surrounding spaces and capitals', () => {
    expect(
      validateBooking(
        { name: '  Kasia ', email: '  Kasia@Example.com ', workshopId: 'visual-testing' },
        workshops,
      ),
    ).toEqual({})
  })
})
