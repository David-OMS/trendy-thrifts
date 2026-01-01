import { useState, useEffect } from 'react'
import { Product, Order } from '../types'
import { getOrders, getInventory } from '../utils/db-api'
import { RefreshCw, Plus, Package, BarChart3 } from 'lucide-react'
import { ToastProvider, useToastContext } from '../contexts/ToastContext'
import Toast from './Toast'
import ProductGrid from './ProductGrid'
import OrderManager from './OrderManager'
import InventoryManager from './InventoryManager'
import './Form.css'

function FormContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'add' | 'orders' | 'inventory'>('add')
  const [loading, setLoading] = useState(true)
  const { toasts, removeToast, success } = useToastContext()

  useEffect(() => {
    loadData()
    // Poll every 5 seconds for real-time updates (much faster now with DB)
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      // Load from database API (fast! - current_stock calculated on the fly)
      const [inventoryData, ordersData] = await Promise.all([
        getInventory(), // Fast DB query with current_stock calculated
        getOrders() // Fast DB query
      ])
      
      setProducts(inventoryData)
      setOrders(ordersData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const handleOrderAdded = () => {
    loadData()
    // Toast is shown in ProductGrid component
  }

  const handleOrderUpdated = () => {
    loadData()
  }

  const handleInventoryUpdated = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="form-loading">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    )
  }

  // Determine dashboard URL based on environment
  const getDashboardUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000'
    }
    return '/dashboard'
  }

  return (
    <div className="form-container">
      <header className="form-header">
        <div className="header-content">
          <div>
            <h1>Order Management</h1>
            <p className="subtitle">Trendy Thrifts</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href={getDashboardUrl()} className="home-link" style={{ fontSize: '0.875rem' }} title="View Dashboard">
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </a>
          <button onClick={loadData} className="refresh-btn">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          <Plus size={18} />
          New Order
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={18} />
          Orders
        </button>
        <button 
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => setActiveTab('inventory')}
        >
          <BarChart3 size={18} />
          Inventory
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === 'add' && (
          <ProductGrid 
            products={products} 
            orders={orders}
            onOrderAdded={handleOrderAdded}
          />
        )}
        {activeTab === 'orders' && (
          <OrderManager 
            orders={orders}
            onOrderUpdated={() => {
              handleOrderUpdated()
              // Force immediate refresh to see deleted order removed
              setTimeout(() => loadData(), 1000)
            }}
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryManager 
            products={products}
            onInventoryUpdated={() => {
              handleInventoryUpdated()
              // Force immediate refresh to see updated inventory
              setTimeout(() => loadData(), 1000)
            }}
          />
        )}
      </main>

      <aside className="sidebar">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="label">Pending</span>
            <span className="value">{orders.filter(o => o.status === 'Pending').length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Fulfilled</span>
            <span className="value">{orders.filter(o => o.status === 'Fulfilled').length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Low Stock</span>
            <span className="value warning">{products.filter(p => {
              const stock = p.current_stock ?? p.stock_level
              const threshold = p.reorder_threshold
              // Count LOW (at or below threshold), WARNING (approaching threshold), and OVERSOLD (negative)
              // WARNING: above threshold but at or below 2x threshold
              const warningThreshold = threshold * 2
              return stock <= threshold || (stock > threshold && stock <= warningThreshold) || stock < 0
            }).length}</span>
          </div>
        </div>
      </aside>

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  )
}

function Form() {
  return (
    <ToastProvider>
      <FormContent />
    </ToastProvider>
  )
}

export default Form
