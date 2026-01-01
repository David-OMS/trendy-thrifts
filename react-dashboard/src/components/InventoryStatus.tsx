import { Inventory } from '../types'
import './InventoryStatus.css'

interface InventoryStatusProps {
  inventory: Inventory[]
}

function InventoryStatus({ inventory }: InventoryStatusProps) {
  // Sort inventory by severity: OVERSOLD first, then LOW, then WARNING, then OK
  const sortedInventory = [...inventory].sort((a, b) => {
    const statusOrder: Record<string, number> = { OVERSOLD: 1, LOW: 2, WARNING: 3, OK: 4 }
    const aStatus = a.stock_status || 'OK'
    const bStatus = b.stock_status || 'OK'
    return (statusOrder[aStatus] || 99) - (statusOrder[bStatus] || 99)
  })

  const getStatusConfig = (currentStock: number, threshold: number) => {
    const percentage = (currentStock / (currentStock + 50)) * 100 // Assuming max stock of current + 50 for display
    
    if (currentStock <= threshold || currentStock <= 0) {
      return {
        color: '#ef4444',
        label: 'Critical',
        bg: 'rgba(254, 242, 242, 0.2)'
      }
    } else if (percentage <= 45) {
      return {
        color: '#f59e0b',
        label: 'Low',
        bg: 'rgba(255, 251, 235, 0.2)'
      }
    } else if (percentage <= 80) {
      return {
        color: '#3b82f6',
        label: 'Good',
        bg: 'rgba(239, 246, 255, 0.2)'
      }
    } else {
      return {
        color: '#10b981',
        label: 'Excellent',
        bg: 'rgba(236, 253, 245, 0.2)'
      }
    }
  }

  const lowStockCount = sortedInventory.filter(inv => {
    // Count LOW (at or below threshold), WARNING (approaching threshold), and OVERSOLD (negative)
    const threshold = inv.reorder_threshold
    const warningThreshold = threshold * 2
    return inv.current_stock <= threshold || 
           (inv.current_stock > threshold && inv.current_stock <= warningThreshold) || 
           inv.current_stock < 0
  }).length

  const totalItems = sortedInventory.reduce((sum, inv) => sum + inv.current_stock, 0)

  return (
    <div className="inventory-card">
      <h3 className="inventory-title">Inventory Status</h3>
      <div className="inventory-list">
        {sortedInventory.slice(0, 5).map((item) => {
          const config = getStatusConfig(item.current_stock, item.reorder_threshold)
          const maxStock = item.current_stock + 50 // Display calculation
          const percentage = Math.max(0, Math.min(100, (item.current_stock / maxStock) * 100))
          
          return (
            <div key={item.product_id} className="inventory-item">
              <div className="inventory-header-row">
                <span className="inventory-name">{item.name}</span>
                <span className="inventory-count">{item.current_stock}/{maxStock}</span>
                <span 
                  className="inventory-badge"
                  style={{ 
                    backgroundColor: `${config.color}20`,
                    color: config.color
                  }}
                >
                  {config.label}
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: config.color,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="inventory-summary">
        <div className="summary-item">
          <div className="summary-label">Total Items</div>
          <div className="summary-value">{totalItems}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Low Stock</div>
          <div className="summary-value low-stock">{lowStockCount}</div>
        </div>
      </div>
    </div>
  )
}

export default InventoryStatus

