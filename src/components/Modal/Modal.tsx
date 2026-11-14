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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog || dialog.open) return
    // A native modal dialog makes everything behind it inert, so focus can't leave it.
    dialog.showModal()
    closeRef.current?.focus()
  }, [open])

  // Closing the native dialog first hands focus back to whatever had it before it opened.
  function requestClose() {
    dialogRef.current?.close()
    onClose()
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="modal"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault() // we close it ourselves, so the browser's cancel doesn't fire twice
          requestClose()
        }
      }}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
    >
      <h2 id={titleId} className="modal__title">
        {title}
      </h2>
      <div>{children}</div>
      <div className="modal__actions">
        <Button ref={closeRef} onClick={requestClose}>
          Close
        </Button>
      </div>
    </dialog>
  )
}
