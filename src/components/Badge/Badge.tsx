import { availability } from '../../booking'
import './Badge.css'

export function Badge({ seatsLeft }: { seatsLeft: number }) {
  const level = availability(seatsLeft)
  const text =
    level === 'soldOut' ? 'Sold out' : level === 'few' ? `Only ${seatsLeft} seats left` : `${seatsLeft} seats left`
  return <span className={`badge badge--${level}`}>{text}</span>
}
