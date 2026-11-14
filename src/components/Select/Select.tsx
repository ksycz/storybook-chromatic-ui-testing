import '../TextField/TextField.css'

type SelectOption = { value: string; label: string; disabled?: boolean }

type SelectProps = {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export function Select({ label, name, value, onChange, options, placeholder, error }: SelectProps) {
  const errorId = name + '-error'
  return (
    <div className="field">
      <label htmlFor={name} className="field__label">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="field__control"
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}
