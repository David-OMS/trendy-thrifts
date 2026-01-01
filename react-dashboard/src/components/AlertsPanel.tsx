import { AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Alert } from '../types'
import './AlertsPanel.css'

interface AlertsPanelProps {
  alerts: Alert[]
}

function AlertsPanel({ alerts }: AlertsPanelProps) {
  // Sort alerts by severity: High first, then Medium, then Low
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 }
    return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99)
  })

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'High':
        return {
          bg: 'rgba(254, 242, 242, 1)',
          border: 'rgba(254, 202, 202, 1)',
          icon: AlertCircle,
          iconColor: '#dc2626',
          textColor: '#991b1b'
        }
      case 'Medium':
        return {
          bg: 'rgba(255, 251, 235, 1)',
          border: 'rgba(253, 230, 138, 1)',
          icon: Info,
          iconColor: '#d97706',
          textColor: '#92400e'
        }
      default:
        return {
          bg: 'rgba(236, 253, 245, 1)',
          border: 'rgba(167, 243, 208, 1)',
          icon: CheckCircle,
          iconColor: '#059669',
          textColor: '#065f46'
        }
    }
  }

  return (
    <div className="alerts-card">
      <h3 className="alerts-title">Alerts</h3>
      <div className="alerts-scroll">
        {sortedAlerts.length === 0 ? (
          <div className="no-alerts">No active alerts</div>
        ) : (
          sortedAlerts.map((alert, idx) => {
            const config = getSeverityConfig(alert.severity)
            const Icon = config.icon
            return (
              <div
                key={idx}
                className="alert-item"
                style={{
                  backgroundColor: config.bg,
                  borderColor: config.border
                }}
              >
                <div className="alert-icon-container" style={{ color: config.iconColor }}>
                  <Icon size={20} />
                </div>
                <div className="alert-content">
                  <div className="alert-title" style={{ color: config.textColor }}>
                    {alert.alert_type}
                  </div>
                  <div className="alert-message">{alert.message}</div>
                  {alert.product_name && (
                    <div className="alert-product">Product: {alert.product_name}</div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AlertsPanel
