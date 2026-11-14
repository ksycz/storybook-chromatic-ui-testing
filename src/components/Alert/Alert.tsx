import type { ReactNode } from 'react'
import './Alert.css'

export function Alert({ tone, children }: { tone: 'success' | 'error'; children: ReactNode }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`alert alert--${tone}`}>
      {children}
    </div>
  )
}
