import { availability, type Workshop } from '../../booking'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import './WorkshopCard.css'

type WorkshopCardProps = {
  workshop: Workshop
  onBook?: (id: string) => void
}

export function WorkshopCard({ workshop, onBook }: WorkshopCardProps) {
  const soldOut = availability(workshop.seatsLeft) === 'soldOut'
  return (
    <article className="card">
      <h3 className="card__title">{workshop.title}</h3>
      <p className="card__date">{workshop.date}</p>
      <Badge seatsLeft={workshop.seatsLeft} />
      <Button variant="secondary" disabled={soldOut} onClick={() => onBook?.(workshop.id)}>
        Book
      </Button>
    </article>
  )
}
