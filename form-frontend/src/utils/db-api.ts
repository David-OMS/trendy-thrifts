/**
 * Database API Client
 * New fast API endpoints using SQLite
 */

const API_BASE = 'http://localhost:3001/api';

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

export interface Product {
  product_id: string
  name: string
  stock_level: number
  reorder_threshold: number
}

// ===== ORDERS =====

export async function getOrders(status?: string): Promise<Order[]> {
  try {
    const url = status ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch orders`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function createOrder(order: Omit<Order, 'order_id'>): Promise<Order | null> {
  try {
    // Don't generate ID here - let the server generate it from database
    // This prevents ID jumps if frontend has stale data
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    
    if (!response.ok) throw new Error('Failed to create order');
    const result = await response.json();
    return result.order;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

export async function updateOrderStatus(orderId: number, status: 'Fulfilled' | 'Cancelled', fulfilled_by?: string): Promise<boolean> {
  try {
    const updates: any = { status };
    if (fulfilled_by) updates.fulfilled_by = fulfilled_by;
    
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}

export async function deleteOrder(orderId: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
}

// ===== INVENTORY =====

export async function getInventory(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/inventory`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

export async function updateStock(productId: string, stockLevel: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/inventory/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_level: stockLevel })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
}

