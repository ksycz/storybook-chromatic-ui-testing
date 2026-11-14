import './TextField.css'

type TextFieldProps = {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email'
  error?: string
  disabled?: boolean
}

export function TextField({ label, name, value, onChange, type = 'text', error, disabled }: TextFieldProps) {
  const errorId = name + '-error'
  return (
    <div className="field">
      <label htmlFor={name} className="field__label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="field__control"
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}
