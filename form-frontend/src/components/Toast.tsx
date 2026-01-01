import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 3000) // Auto-remove after 3 seconds

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <XCircle size={20} />
      case 'warning':
        return <AlertCircle size={20} />
      case 'info':
        return <Info size={20} />
    }
  }

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={() => onRemove(toast.id)}>
        ×
      </button>
    </div>
  )
}

export default ToastComponent

