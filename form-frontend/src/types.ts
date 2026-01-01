export interface Product {
  product_id: string
  name: string
  stock_level: number  // Original/starting stock
  current_stock?: number  // Available stock after sales (from Inventory_Status)
  quantity_sold?: number  // Quantity sold (from Inventory_Status)
  reorder_threshold: number
  stock_status?: 'OK' | 'LOW' | 'WARNING' | 'OVERSOLD'  // Status from Inventory_Status
}

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

