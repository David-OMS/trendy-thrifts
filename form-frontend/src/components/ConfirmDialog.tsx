import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className={`confirm-dialog confirm-dialog-${variant}`} onClick={(e) => e.stopPropagation()}>
        <button className="confirm-dialog-close" onClick={onCancel}>
          <X size={20} />
        </button>
        <div className="confirm-dialog-icon">
          <AlertTriangle size={32} />
        </div>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button className="confirm-dialog-button confirm-dialog-button-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`confirm-dialog-button confirm-dialog-button-${variant}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

