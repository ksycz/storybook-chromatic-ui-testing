import type { ReactNode, Ref } from 'react'
import './Button.css'

type ButtonProps = {
  variant?: 'primary' | 'secondary'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  ref?: Ref<HTMLButtonElement>
  children: ReactNode
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ref,
  children,
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`button button--${variant}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {loading ? 'Booking…' : children}
    </button>
  )
}
