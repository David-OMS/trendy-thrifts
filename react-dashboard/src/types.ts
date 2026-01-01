export interface Order {
  order_id: number
  channel: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  status: 'Fulfilled' | 'Pending' | 'Cancelled'
  date: string
  fulfilled_by?: string
}

export interface Inventory {
  product_id: string
  name: string
  stock_level: number
  quantity_sold: number
  current_stock: number
  reorder_threshold: number
  stock_status: 'OK' | 'LOW' | 'WARNING' | 'OVERSOLD'
}

export interface DailyRevenue {
  date: string
  revenue: number
  quantity_sold: number
  orders_count: number
}

export interface ChannelPerformance {
  channel: string
  revenue: number
  quantity_sold: number
  orders_count: number
}

export interface ProductPerformance {
  product_id: string
  product_name: string
  revenue: number
  quantity_sold: number
  orders_count: number
}

export interface Alert {
  alert_type: string
  severity: 'High' | 'Medium' | 'Low'
  product_id: string
  product_name: string
  current_stock?: number
  message: string
  action_required: string
  timestamp: string
}

