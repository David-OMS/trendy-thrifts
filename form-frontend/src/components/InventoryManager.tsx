import { useState, useMemo } from 'react'
import { Product } from '../types'
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToastContext } from '../contexts/ToastContext'
import { updateStock } from '../utils/db-api'
import './InventoryManager.css'

interface InventoryManagerProps {
  products: Product[]
  onInventoryUpdated: () => void
}

function InventoryManager({ products, onInventoryUpdated }: InventoryManagerProps) {
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15
  const { success, error } = useToastContext()

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return products.slice(start, start + itemsPerPage)
  }, [products, currentPage])

  const totalPages = Math.ceil(products.length / itemsPerPage)

  const handleUpdateStock = async (productId: string, newCurrentStock: number) => {
    const product = products.find(p => p.product_id === productId)
    if (!product) return

    // User is updating the AVAILABLE stock (current_stock)
    // To get new stock_level: stock_level = current_stock + quantity_sold
    const quantitySold = product.quantity_sold ?? 0
    const newStockLevel = newCurrentStock + quantitySold

    try {
      // Update database (will trigger sync to CSV and Sheets)
      const result = await updateStock(productId, newStockLevel)
      
      if (result) {
        setEditingStock(prev => {
          const next = { ...prev }
          delete next[productId]
          return next
        })
        onInventoryUpdated()
        success(`Stock updated for ${product.name}`)
      } else {
        error('Failed to update inventory')
      }
    } catch (err) {
      console.error('Error:', err)
      error('Failed to update inventory. Please try again.')
    }
  }

  const adjustStock = async (productId: string, delta: number) => {
    const product = products.find(p => p.product_id === productId)
    if (!product) return

    const currentStock = product.current_stock ?? product.stock_level
    const newStock = Math.max(0, currentStock + delta)
    await handleUpdateStock(productId, newStock)
  }

  const getStockStatus = (product: Product) => {
    const stock = product.current_stock ?? product.stock_level
    const threshold = product.reorder_threshold
    
    // Match logic from phase2_business_logic.py
    if (stock < 0) return 'oversold'  // OVERSOLD
    if (stock <= threshold) return 'low'  // LOW (at or below threshold)
    
    // WARNING: above threshold but at or below 2x threshold
    const warningThreshold = threshold * 2
    if (stock <= warningThreshold) return 'warning'  // WARNING
    
    return 'ok'  // OK (above 2x threshold)
  }

  const handleStockInputChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0
    setEditingStock(prev => ({ ...prev, [productId]: numValue }))
  }

  const handleStockInputBlur = (productId: string) => {
    const newStock = editingStock[productId]
    if (newStock !== undefined) {
      handleUpdateStock(productId, newStock)
    }
  }

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <p className="subtitle">Update stock levels for all products</p>
      </div>

      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Reorder Threshold</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map(product => {
              const status = getStockStatus(product)
              const currentStock = product.current_stock ?? product.stock_level
              const editingValue = editingStock[product.product_id] !== undefined 
                ? editingStock[product.product_id] 
                : currentStock

              return (
                <tr key={product.product_id} className={`inventory-row ${status}`}>
                  <td className="product-cell">
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-id">{product.product_id}</span>
                    </div>
                  </td>
                  <td className="stock-cell">
                    <div className="stock-controls">
                      <button
                        className="stock-btn decrease"
                        onClick={() => adjustStock(product.product_id, -1)}
                        disabled={currentStock === 0}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={editingValue}
                        onChange={(e) => handleStockInputChange(product.product_id, e.target.value)}
                        onBlur={() => handleStockInputBlur(product.product_id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleStockInputBlur(product.product_id)
                          }
                        }}
                        className="stock-input"
                      />
                      <button
                        className="stock-btn increase"
                        onClick={() => adjustStock(product.product_id, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="threshold-cell">
                    <span className="threshold-value">{product.reorder_threshold}</span>
                  </td>
                  <td>
                    <span className={`status-indicator ${status}`}>
                      {status === 'ok' && 'In Stock'}
                      {status === 'warning' && 'Warning'}
                      {status === 'low' && 'Low Stock'}
                      {status === 'oversold' && 'Oversold'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="quick-add-btn"
                      onClick={() => adjustStock(product.product_id, 10)}
                    >
                      +10
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="page-btn"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages} ({products.length} total)
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function parseCSV(csv: string): any[] {
  const lines = csv.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const obj: any = {}
    headers.forEach((header, i) => {
      const value = values[i] || ''
      if (header.includes('stock') || header.includes('quantity') || header.includes('threshold') || header.includes('id') && header !== 'product_id') {
        obj[header] = value ? parseInt(value) : 0
      } else {
        obj[header] = value
      }
    })
    return obj
  })
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header] ?? ''
      return `"${value}"`
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export default InventoryManager
