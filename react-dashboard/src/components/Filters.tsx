import { SlidersHorizontal, Calendar } from 'lucide-react'
import './Filters.css'

interface FiltersProps {
  channels: string[]
  products: Array<{ id: string; name: string }>
  selectedChannel: string
  selectedProduct: string
  dateRange: string
  onChannelChange: (channel: string) => void
  onProductChange: (product: string) => void
  onDateRangeChange: (range: string) => void
}

function Filters({ channels, products, selectedChannel, selectedProduct, dateRange, onChannelChange, onProductChange, onDateRangeChange }: FiltersProps) {
  return (
    <div className="filters-card">
      <div className="filters-header">
        <SlidersHorizontal size={20} className="filters-icon" />
        <h3 className="filters-title">Filters</h3>
      </div>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label className="filter-label">Channel</label>
          <select 
            value={selectedChannel} 
            onChange={(e) => onChannelChange(e.target.value)}
            className="filter-select"
          >
            {channels.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Product</label>
          <select 
            value={selectedProduct} 
            onChange={(e) => onProductChange(e.target.value)}
            className="filter-select"
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <Calendar size={14} className="calendar-icon" />
            Date Range
          </label>
          <select 
            value={dateRange} 
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default Filters
