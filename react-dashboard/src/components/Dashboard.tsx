import { useState, useEffect, useMemo } from 'react'
import KPICards from './KPICards'
import RevenueChart from './RevenueChart'
import ChannelChart from './ChannelChart'
import ProductChart from './ProductChart'
import AlertsPanel from './AlertsPanel'
import InventoryStatus from './InventoryStatus'
import Filters from './Filters'
import { TrendingUp, FileText } from 'lucide-react'
import { Order, Alert, Inventory } from '../types'
import './Dashboard.css'

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState<string>('All')
  const [selectedProduct, setSelectedProduct] = useState<string>('All')
  const [dateRange, setDateRange] = useState<string>('All')

  useEffect(() => {
    loadData()
    // Poll every 10 seconds for real-time updates from Google Sheets
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [ordersRes, alertsRes, invRes] = await Promise.all([
        fetch('/api/data/Orders_Clean.csv').then(r => r.text()),
        fetch('/api/data/Alerts.csv').then(r => r.text()),
        fetch('/api/data/Inventory_Status.csv').then(r => r.text())
      ])

      setOrders(parseCSV<Order>(ordersRes))
      setAlerts(parseCSV<Alert>(alertsRes))
      setInventory(parseCSV<Inventory>(invRes))
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const parseCSV = <T,>(csv: string): T[] => {
    const lines = csv.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const obj: any = {}
      headers.forEach((header, i) => {
        const value = values[i] || ''
        if (header === 'order_id' || header.includes('count') || header.includes('quantity') || header.includes('stock') || header.includes('threshold')) {
          obj[header] = value ? parseInt(value) : 0
        } else if (header === 'revenue' || header === 'price') {
          obj[header] = value ? parseFloat(value) : 0
        } else {
          obj[header] = value
        }
      })
      return obj as T
    })
  }

  // Get unique products with names for filter
  const productOptions = useMemo(() => {
    const productMap = new Map<string, string>()
    orders.forEach(order => {
      if (!productMap.has(order.product_id)) {
        productMap.set(order.product_id, order.product_name)
      }
    })
    return Array.from(productMap.entries()).map(([id, name]) => ({ id, name }))
  }, [orders])

  // Filter orders based on selections (matches Excel dashboard logic)
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]
    
    // Channel filter
    if (selectedChannel !== 'All') {
      filtered = filtered.filter(order => order.channel === selectedChannel)
    }
    
    // Product filter
    if (selectedProduct !== 'All') {
      filtered = filtered.filter(order => order.product_id === selectedProduct)
    }
    
    // Date range filter
    if (dateRange !== 'All') {
      const now = new Date()
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(order => new Date(order.date) >= cutoffDate)
    }
    
    return filtered
  }, [orders, selectedChannel, selectedProduct, dateRange])

  // Calculate KPIs (matches Excel dashboard: SUMIF for fulfilled orders only)
  const fulfilledOrders = useMemo(() => 
    filteredOrders.filter(o => o.status === 'Fulfilled'),
    [filteredOrders]
  )
  
  const totalRevenue = useMemo(() => 
    fulfilledOrders.reduce((sum, o) => sum + o.price, 0),
    [fulfilledOrders]
  )

  // Recalculate daily revenue from filtered orders (affected by all filters)
  const filteredDailyRevenue = useMemo(() => {
    // Group fulfilled orders by date
    const dateMap = new Map<string, { revenue: number; quantity: number; orderCount: number }>()
    fulfilledOrders.forEach(order => {
      const dateKey = new Date(order.date).toISOString().split('T')[0]
      const existing = dateMap.get(dateKey) || { revenue: 0, quantity: 0, orderCount: 0 }
      dateMap.set(dateKey, {
        revenue: existing.revenue + order.price,
        quantity: existing.quantity + order.quantity,
        orderCount: existing.orderCount + 1
      })
    })
    
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        quantity_sold: data.quantity,
        orders_count: data.orderCount
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [fulfilledOrders])

  // Recalculate channel performance from filtered orders (affected by all filters)
  const filteredChannelPerf = useMemo(() => {
    const channelMap = new Map<string, { revenue: number; quantity: number; orderCount: number }>()
    fulfilledOrders.forEach(order => {
      const existing = channelMap.get(order.channel) || { revenue: 0, quantity: 0, orderCount: 0 }
      channelMap.set(order.channel, {
        revenue: existing.revenue + order.price,
        quantity: existing.quantity + order.quantity,
        orderCount: existing.orderCount + 1
      })
    })
    return Array.from(channelMap.entries()).map(([channel, data]) => ({
      channel,
      revenue: data.revenue,
      quantity_sold: data.quantity,
      orders_count: data.orderCount
    }))
  }, [fulfilledOrders])

  // Orders filtered by channel and date only (NOT product) - for Top 10 Products chart
  const ordersForTop10 = useMemo(() => {
    let filtered = [...orders].filter(o => o.status === 'Fulfilled')
    
    // Channel filter
    if (selectedChannel !== 'All') {
      filtered = filtered.filter(order => order.channel === selectedChannel)
    }
    
    // Date range filter
    if (dateRange !== 'All') {
      const now = new Date()
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(order => new Date(order.date) >= cutoffDate)
    }
    
    return filtered
  }, [orders, selectedChannel, dateRange])

  // Top 10 Products - NOT affected by product filter, but affected by date/channel filters
  // This shows the top 10 products overall within the filtered timeframe
  const top10Products = useMemo(() => {
    const productMap = new Map<string, { revenue: number; quantity: number; orderCount: number; name: string }>()
    ordersForTop10.forEach(order => {
      const existing = productMap.get(order.product_id) || { revenue: 0, quantity: 0, orderCount: 0, name: order.product_name }
      productMap.set(order.product_id, {
        revenue: existing.revenue + order.price,
        quantity: existing.quantity + order.quantity,
        orderCount: existing.orderCount + 1,
        name: order.product_name
      })
    })
    return Array.from(productMap.entries())
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.name,
        revenue: data.revenue,
        quantity_sold: data.quantity,
        orders_count: data.orderCount
      }))
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, 10)
  }, [ordersForTop10])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Animated Background Orbs */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <TrendingUp size={40} className="header-icon" />
            <div>
              <h1 className="header-title">Trendy Thrifts</h1>
              <p className="header-subtitle">Analytics Dashboard</p>
            </div>
          </div>
          <a 
            href={window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3002' : '/form'} 
            className="home-link" 
            title="Order Entry Form"
          >
            <FileText size={20} />
            <span>Order Entry</span>
          </a>
        </header>

        {/* Filter Bar */}
        <Filters
          channels={['All', ...new Set(orders.map(o => o.channel))]}
          products={[{ id: 'All', name: 'All Products' }, ...productOptions]}
          selectedChannel={selectedChannel}
          selectedProduct={selectedProduct}
          dateRange={dateRange}
          onChannelChange={setSelectedChannel}
          onProductChange={setSelectedProduct}
          onDateRangeChange={setDateRange}
        />

        {/* KPI Cards */}
        <KPICards
          totalRevenue={totalRevenue}
          fulfilledOrders={fulfilledOrders.length}
          pendingOrders={filteredOrders.filter(o => o.status === 'Pending').length}
          cancelledOrders={filteredOrders.filter(o => o.status === 'Cancelled').length}
        />

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card revenue-chart-card">
            <RevenueChart data={filteredDailyRevenue} dateRange={dateRange} />
          </div>
          <div className="chart-card channel-chart-card">
            <ChannelChart data={filteredChannelPerf} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-grid">
          <div className="chart-card products-chart-card">
            <ProductChart data={top10Products} />
          </div>
          <div className="right-column">
            <AlertsPanel alerts={alerts} />
            <InventoryStatus inventory={inventory} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
