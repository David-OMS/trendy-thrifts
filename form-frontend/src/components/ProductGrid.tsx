import { useState, useEffect, useMemo } from 'react'
import { Product, Order } from '../types'
import { Check } from 'lucide-react'
import { useToastContext } from '../contexts/ToastContext'
import { createOrder } from '../utils/db-api'
import './ProductGrid.css'

interface ProductGridProps {
  products: Product[]
  orders: Order[]
  onOrderAdded: () => void
}

function ProductGrid({ products, orders, onOrderAdded }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [channel, setChannel] = useState<'Website' | 'Instagram' | 'WhatsApp' | 'Facebook'>('Website')
  const [unitPrice, setUnitPrice] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [customQuantityValue, setCustomQuantityValue] = useState<string>('')
  const [isUsingCustomInput, setIsUsingCustomInput] = useState(false)
  const itemsPerPage = 15
  const { success, error } = useToastContext()

  // Calculate average price for a product from orders
  const getAveragePrice = (productId: string): number => {
    const productOrders = orders.filter(o => 
      o.product_id === productId && o.status === 'Fulfilled'
    )
    if (productOrders.length === 0) return 0
    
    const totalRevenue = productOrders.reduce((sum, o) => sum + o.price, 0)
    const totalQuantity = productOrders.reduce((sum, o) => sum + o.quantity, 0)
    return totalQuantity > 0 ? totalRevenue / totalQuantity : 0
  }

  // Pagination
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return products.slice(start, start + itemsPerPage)
  }, [products, currentPage])

  const totalPages = Math.ceil(products.length / itemsPerPage)

  const getNextOrderId = () => {
    if (orders.length === 0) return 1000
    return Math.max(...orders.map(o => o.order_id)) + 1
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

  // Auto-fill price when product is selected
  useEffect(() => {
    if (selectedProduct && unitPrice === '') {
      const avgPrice = getAveragePrice(selectedProduct.product_id)
      if (avgPrice > 0) {
        setUnitPrice(avgPrice.toFixed(2))
      }
    }
  }, [selectedProduct])

  const handleAddOrder = async () => {
    const price = parseFloat(unitPrice)
    if (!selectedProduct || !price || price <= 0) {
      error('Please select a product and enter a valid price')
      return
    }

    // Check stock availability
    const availableStock = selectedProduct.current_stock ?? selectedProduct.stock_level
    if (availableStock < 0) {
      error('Cannot create order: This product is oversold (negative stock)')
      return
    }
    
    if (quantity > availableStock) {
      error(`Not enough stock: Only ${availableStock} units available, but trying to order ${quantity}`)
      return
    }

    const newOrder = {
      channel,
      product_id: selectedProduct.product_id,
      product_name: selectedProduct.name,
      quantity,
      price: price * quantity,
      status: 'Pending' as const,
      date: new Date().toISOString().split('T')[0],
      fulfilled_by: ''
    }
    
    try {
      const created = await createOrder(newOrder)
      
      if (created) {
        setSelectedProduct(null)
        setQuantity(1)
        setUnitPrice('')
        setCurrentPage(1)
        success('Order added successfully!')
        onOrderAdded()
      } else {
        error('Failed to save order')
      }
    } catch (err) {
      console.error('Error:', err)
      error('Failed to save order. Please try again.')
    }
  }

  return (
    <div className="product-grid-full-page">
      <div className="product-selection-compact">
        <h2>Select Product</h2>
        <div className="products-grid-compact">
          {paginatedProducts.map(product => {
            const status = getStockStatus(product)
            const isSelected = selectedProduct?.product_id === product.product_id
            const availableStock = product.current_stock ?? product.stock_level
            const isOversold = availableStock < 0
            
            return (
              <button
                key={product.product_id}
                className={`product-card ${status} ${isSelected ? 'selected' : ''} ${isOversold ? 'disabled' : ''}`}
                disabled={isOversold}
                onClick={() => {
                  if (isOversold) {
                    error('Cannot select: This product is oversold (negative stock)')
                    return
                  }
                  if (isSelected) {
                    // Allow deselection
                    setSelectedProduct(null)
                    setUnitPrice('')
                  } else {
                    setSelectedProduct(product)
                    const avgPrice = getAveragePrice(product.product_id)
                    setUnitPrice(avgPrice > 0 ? avgPrice.toFixed(2) : '')
                    // Reset quantity to 1 when selecting a new product
                    setQuantity(1)
                  }
                }}
              >
                {isSelected && (
                  <div className="selected-indicator">
                    <Check size={16} />
                  </div>
                )}
                <div className="product-status-indicator" data-status={status}></div>
                <div className="product-name">{product.name}</div>
                <div className="product-stock">{(product.current_stock ?? product.stock_level)} units</div>
              </button>
            )
          })}
        </div>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="page-btn"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="order-details-panel-compact">
          <h2>Order Details</h2>
          <div className="selected-product-badge">
            <Check size={16} />
            <span>{selectedProduct.name}</span>
          </div>

          <div className="form-section">
            <label>Sales Channel</label>
            <div className="channel-grid">
              {(['Website', 'Instagram', 'WhatsApp', 'Facebook'] as const).map(ch => (
                <button
                  key={ch}
                  className={channel === ch ? 'active' : ''}
                  onClick={() => setChannel(ch)}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>Quantity</label>
            <div className="quantity-grid">
              {[1, 2, 3, 4, 5].map(qty => {
                const availableStock = selectedProduct.current_stock ?? selectedProduct.stock_level
                const isDisabled = qty > availableStock || availableStock < 0
                // Only show as active if quantity matches AND not using custom input
                const isActive = !isUsingCustomInput && quantity === qty
                return (
                  <button
                    key={qty}
                    className={isActive ? 'active' : ''}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) {
                        error(`Cannot select ${qty}: Only ${availableStock} units available`)
                        return
                      }
                      setIsUsingCustomInput(false)
                      setCustomQuantityValue('')
                      setQuantity(qty)
                    }}
                    title={isDisabled ? `Only ${availableStock} units available` : ''}
                  >
                    {qty}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <label htmlFor="custom-quantity" style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: '#475569',
                marginBottom: '0.5rem'
              }}>
                Or enter custom quantity:
              </label>
              <input
                id="custom-quantity"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customQuantityValue}
                onChange={(e) => {
                  // Only allow numeric input
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  setCustomQuantityValue(value)
                  
                  // Update quantity if valid number
                  if (value === '') {
                    // Allow empty for typing/deleting
                    return
                  }
                  const numValue = parseInt(value)
                  if (numValue > 0) {
                    setQuantity(numValue)
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent arrow keys from triggering button highlights
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    return
                  }
                  // Allow: numbers, backspace, delete, tab, enter, arrow keys (left/right), home, end
                  // Block everything else except Ctrl/Cmd combinations (for copy/paste)
                  if (!/[0-9]/.test(e.key) && 
                      !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) &&
                      !(e.ctrlKey || e.metaKey) &&
                      !(e.key === 'a' && (e.ctrlKey || e.metaKey))) { // Allow Ctrl+A / Cmd+A
                    e.preventDefault()
                  }
                }}
                onFocus={(e) => {
                  setIsUsingCustomInput(true)
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  // If quantity is 1-5, clear the input to allow fresh typing
                  // If quantity > 5, show it
                  if (quantity <= 5) {
                    setCustomQuantityValue('')
                  } else {
                    setCustomQuantityValue(quantity.toString())
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                  const value = parseInt(e.target.value) || 0
                  if (value === 0 || e.target.value === '') {
                    // If empty or 0, reset to 1
                    setQuantity(1)
                    setCustomQuantityValue('')
                    setIsUsingCustomInput(false)
                  } else {
                    // Keep the value if valid
                    setCustomQuantityValue(value > 5 ? value.toString() : '')
                    setIsUsingCustomInput(false)
                  }
                }}
                onClick={(e) => {
                  // Stop event propagation to prevent any button clicks
                  e.stopPropagation()
                }}
                placeholder="Enter quantity"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
            {selectedProduct && (
              <div className="stock-warning" style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.875rem',
                color: (() => {
                  const availableStock = selectedProduct.current_stock ?? selectedProduct.stock_level
                  if (availableStock < 0) return '#dc2626'
                  if (quantity > availableStock) return '#dc2626'
                  if (availableStock <= selectedProduct.reorder_threshold) return '#f59e0b'
                  return '#64748b'
                })()
              }}>
                Available: {selectedProduct.current_stock ?? selectedProduct.stock_level} units
                {quantity > (selectedProduct.current_stock ?? selectedProduct.stock_level) && (
                  <span style={{ display: 'block', marginTop: '0.25rem', fontWeight: 600 }}>
                    ⚠️ Not enough stock for {quantity} units
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="unit-price">Unit Price ($)</label>
            <input
              id="unit-price"
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0.00"
            />
            <div className="total-display">
              <span>Total Amount</span>
              <strong>${((parseFloat(unitPrice) || 0) * quantity).toFixed(2)}</strong>
            </div>
          </div>

          <button 
            className="submit-order-btn" 
            onClick={handleAddOrder}
            disabled={(() => {
              if (!selectedProduct) return true
              const availableStock = selectedProduct.current_stock ?? selectedProduct.stock_level
              return availableStock < 0 || quantity > availableStock
            })()}
          >
            Create Order
          </button>
          {selectedProduct && (() => {
            const availableStock = selectedProduct.current_stock ?? selectedProduct.stock_level
            if (availableStock < 0) {
              return (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.75rem', 
                  background: '#fee2e2', 
                  color: '#991b1b', 
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  ⚠️ Cannot create order: Product is oversold ({availableStock} units)
                </div>
              )
            }
            if (quantity > availableStock) {
              return (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.75rem', 
                  background: '#fee2e2', 
                  color: '#991b1b', 
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  ⚠️ Not enough stock: Only {availableStock} units available, but trying to order {quantity}
                </div>
              )
            }
            return null
          })()}
        </div>
      )}
    </div>
  )
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

export default ProductGrid
