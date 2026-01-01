import { useState, useMemo, useEffect, useRef } from 'react'
import { Order } from '../types'
import { Check, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToastContext } from '../contexts/ToastContext'
import { updateOrderStatus, deleteOrder } from '../utils/db-api'
import ConfirmDialog from './ConfirmDialog'
import './OrderManager.css'

interface OrderManagerProps {
  orders: Order[]
  onOrderUpdated: () => void
}

function OrderManager({ orders, onOrderUpdated }: OrderManagerProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Fulfilled' | 'Cancelled'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const previousOrdersRef = useRef<Order[]>([])
  const itemsPerPage = 15
  const { success, error } = useToastContext()

  const filteredOrders = useMemo(() => {
    const filtered = statusFilter === 'All' 
      ? orders 
      : orders.filter(o => o.status === statusFilter)
    
    // Sort by date (oldest first, so newest orders appear at the end/last page)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB // Oldest first
    })
    
    return sorted
  }, [orders, statusFilter])
  
  // Reset to page 1 only when filter changes, not when orders update
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])
  
  // Adjust page if current page is out of bounds after filtering
  useEffect(() => {
    const maxPage = Math.ceil(filteredOrders.length / itemsPerPage) || 1
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [filteredOrders.length, currentPage, itemsPerPage])
  
  // Track when orders change and show visual feedback
  useEffect(() => {
    if (previousOrdersRef.current.length > 0) {
      const orderIdsChanged = JSON.stringify(previousOrdersRef.current.map(o => ({ id: o.order_id, status: o.status }))) !== 
                              JSON.stringify(orders.map(o => ({ id: o.order_id, status: o.status })))
      if (orderIdsChanged) {
        setIsUpdating(true)
        setLastUpdateTime(new Date())
        setTimeout(() => setIsUpdating(false), 500)
      }
    }
    previousOrdersRef.current = orders
  }, [orders])

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(start, start + itemsPerPage)
  }, [filteredOrders, currentPage])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const handleUpdateOrderStatus = async (orderId: number, newStatus: 'Fulfilled' | 'Cancelled') => {
    try {
      const fulfilled_by = newStatus === 'Fulfilled' ? 'Staff' : undefined
      const result = await updateOrderStatus(orderId, newStatus, fulfilled_by)
      
      if (result) {
        onOrderUpdated()
        success(`Order #${orderId} marked as ${newStatus}`)
      } else {
        error('Failed to update order')
      }
    } catch (err) {
      console.error('Error:', err)
      error('Failed to update order. Please try again.')
    }
  }

  const handleDeleteClick = (orderId: number) => {
    setConfirmDelete(orderId)
  }

  const handleDeleteConfirm = async () => {
    const orderId = confirmDelete
    if (!orderId) return

    setConfirmDelete(null)
    setDeletingOrderId(orderId)
    
    try {
      const result = await deleteOrder(orderId)
      
      if (result) {
        success(`Order #${orderId} deleted successfully`)
        onOrderUpdated()
      } else {
        error('Failed to delete order')
      }
    } catch (err) {
      console.error('Error:', err)
      error('Failed to delete order. Please try again.')
    } finally {
      setDeletingOrderId(null)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Fulfilled': return 'status-badge fulfilled'
      case 'Pending': return 'status-badge pending'
      case 'Cancelled': return 'status-badge cancelled'
      default: return 'status-badge'
    }
  }

  return (
    <div className={`order-manager ${isUpdating ? 'updating' : ''}`}>
      <div className="order-header-info">
        <span className="last-update">
          Last updated: {lastUpdateTime.toLocaleTimeString()}
          {isUpdating && <span className="updating-indicator"> (updating...)</span>}
        </span>
      </div>
      <div className="order-filters">
        {(['All', 'Pending', 'Fulfilled', 'Cancelled'] as const).map(status => (
          <button
            key={status}
            className={statusFilter === status ? 'active' : ''}
            onClick={() => setStatusFilter(status)}
          >
            {status}
            {status !== 'All' && (
              <span className="count">({orders.filter(o => o.status === status).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="orders-table">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Channel</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => (
                  <tr key={order.order_id}>
                    <td className="order-id">#{order.order_id}</td>
                    <td className="product-name">{order.product_name}</td>
                    <td className="channel">{order.channel}</td>
                    <td className="quantity">{order.quantity}</td>
                    <td className="amount">${(typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0).toFixed(2)}</td>
                    <td className="date">{order.date}</td>
                    <td>
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="actions">
                      {order.status === 'Pending' && (
                        <>
                          <button
                            className="action-btn fulfill"
                            onClick={() => handleUpdateOrderStatus(order.order_id, 'Fulfilled')}
                            title="Mark as Fulfilled"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="action-btn cancel"
                            onClick={() => handleUpdateOrderStatus(order.order_id, 'Cancelled')}
                            title="Cancel Order"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteClick(order.order_id)}
                        title="Delete Order"
                        disabled={deletingOrderId === order.order_id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
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
                  Page {currentPage} of {totalPages} ({filteredOrders.length} total)
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
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Delete Order"
        message={`Are you sure you want to delete order #${confirmDelete}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default OrderManager
