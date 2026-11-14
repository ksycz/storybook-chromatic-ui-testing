import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '../Button/Button'
import './Modal.css'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="modal__backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
        }}
      >
        <h2 id={titleId} className="modal__title">
          {title}
        </h2>
        <div>{children}</div>
        <div className="modal__actions">
          <Button ref={closeRef} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
