import { DollarSign, ShoppingBag, Package, XCircle } from 'lucide-react'
import './KPICards.css'

interface KPICardsProps {
  totalRevenue: number
  fulfilledOrders: number
  pendingOrders: number
  cancelledOrders: number
}

// Smart formatter for currency values
function formatCurrency(value: number): string {
  if (value === 0) return '$0'
  
  if (value < 1000) {
    return `$${Math.round(value)}`
  } else if (value < 100000) {
    return `$${(value / 1000).toFixed(1)}k`
  } else if (value < 1000000) {
    return `$${Math.round(value / 1000)}k`
  } else {
    return `$${(value / 1000000).toFixed(2)}M`
  }
}

function KPICards({ totalRevenue, fulfilledOrders, pendingOrders, cancelledOrders }: KPICardsProps) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-icon-container revenue-icon">
          <DollarSign size={24} />
        </div>
        <div className="kpi-content">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-container fulfilled-icon">
          <ShoppingBag size={24} />
        </div>
        <div className="kpi-content">
          <div className="kpi-label">Fulfilled Orders</div>
          <div className="kpi-value">{fulfilledOrders}</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-container pending-icon">
          <Package size={24} />
        </div>
        <div className="kpi-content">
          <div className="kpi-label">Pending Orders</div>
          <div className="kpi-value">{pendingOrders}</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-container cancelled-icon">
          <XCircle size={24} />
        </div>
        <div className="kpi-content">
          <div className="kpi-label">Cancelled Orders</div>
          <div className="kpi-value">{cancelledOrders}</div>
        </div>
      </div>
    </div>
  )
}

export default KPICards
