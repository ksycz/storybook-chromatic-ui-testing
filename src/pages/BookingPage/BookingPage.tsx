import { useRef, useState, type FormEvent } from 'react'
import {
  availability,
  submitBooking,
  validateBooking,
  type BookingErrors,
  type BookingInput,
  type Workshop,
} from '../../booking'
import { Alert, Button, Modal, Select, TextField, WorkshopCard } from '../../components'
import './BookingPage.css'

const EMPTY: BookingInput = { name: '', email: '', workshopId: '' }

export function BookingPage({ workshops }: { workshops: Workshop[] }) {
  const [values, setValues] = useState<BookingInput>(EMPTY)
  const [errors, setErrors] = useState<BookingErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmationId, setConfirmationId] = useState<string | null>(null)
  const inFlight = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  const update = (field: keyof BookingInput) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }))

  function handleBook(id: string) {
    update('workshopId')(id)
    formRef.current?.querySelector<HTMLInputElement>('#name')?.focus()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return

    const found = validateBooking(values, workshops)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    inFlight.current = true
    setSubmitting(true)
    try {
      const { confirmationId: id } = await submitBooking(values)
      setConfirmationId(id)
      setValues(EMPTY)
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  function closeConfirmation() {
    setConfirmationId(null)
    submitRef.current?.focus()
  }

  const options = workshops.map((workshop) => {
    const soldOut = availability(workshop.seatsLeft) === 'soldOut'
    return {
      value: workshop.id,
      label: soldOut ? `${workshop.title} (sold out)` : workshop.title,
      disabled: soldOut,
    }
  })

  return (
    <main className="page">
      <h1>Book a workshop</h1>

      <section aria-labelledby="upcoming">
        <h2 id="upcoming">Upcoming workshops</h2>
        {workshops.length === 0 ? (
          <p>No workshops scheduled yet.</p>
        ) : (
          <div className="page__cards">
            {workshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} onBook={handleBook} />
            ))}
          </div>
        )}
      </section>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="page__form">
        <h2>Your details</h2>
        {Object.keys(errors).length > 0 && <Alert tone="error">Please fix the errors below</Alert>}
        <TextField label="Name" name="name" value={values.name} onChange={update('name')} error={errors.name} />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
        />
        <Select
          label="Workshop"
          name="workshop"
          value={values.workshopId}
          onChange={update('workshopId')}
          options={options}
          placeholder="Choose a workshop"
          error={errors.workshopId}
        />
        <Button ref={submitRef} type="submit" loading={submitting}>
          Book my seat
        </Button>
      </form>

      <Modal open={confirmationId !== null} title="Booking confirmed" onClose={closeConfirmation}>
        Your confirmation number is {confirmationId}.
      </Modal>
    </main>
  )
}
