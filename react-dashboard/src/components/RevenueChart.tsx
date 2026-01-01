import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DailyRevenue } from '../types'
import { format } from 'date-fns'
import './RevenueChart.css'

interface RevenueChartProps {
  data: DailyRevenue[]
  dateRange: string // Pass the date range filter to determine how many days to show
}

// Smart formatter for currency values
function formatCurrency(value: number): string {
  if (value === 0) return '$0'
  
  if (value < 1000) {
    return `$${Math.round(value)}`
  } else if (value < 100000) {
    return `$${(value / 1000).toFixed(1)}k`
  } else if (value < 1000000) {
    return `$${Math.round(value / 1000)}k`
  } else {
    return `$${(value / 1000000).toFixed(2)}M`
  }
}

function RevenueChart({ data, dateRange }: RevenueChartProps) {
  // Group by date and sum revenue (in case of duplicate dates)
  const dateMap = new Map<string, number>()
  data.forEach(d => {
    const dateKey = new Date(d.date).toISOString().split('T')[0] // Normalize to YYYY-MM-DD
    const existing = dateMap.get(dateKey) || 0
    dateMap.set(dateKey, existing + d.revenue)
  })
  
  // Convert to array and sort chronologically (oldest to newest)
  const sortedData = Array.from(dateMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Determine how many days to show based on filter
  let daysToShow: number
  if (dateRange === 'All') {
    // For "All Time", show all days but cap at 60 for readability
    daysToShow = Math.min(sortedData.length, 60)
  } else if (dateRange === '7d') {
    daysToShow = 7
  } else if (dateRange === '30d') {
    daysToShow = 30
  } else if (dateRange === '90d') {
    // For 90 days, cap at 60 for readability (too many days makes chart cluttered)
    daysToShow = Math.min(sortedData.length, 60)
  } else {
    daysToShow = 7 // Default
  }
  
  // Get the last N days (most recent) - always in chronological order
  const chartDays = sortedData.slice(-daysToShow)
  
  // Map to chart format - use numeric index to preserve order
  const chartData = chartDays.map((d, index) => {
    const dateObj = new Date(d.date)
    return {
      dateIndex: index, // Numeric index for X-axis (preserves order)
      dateLabel: format(dateObj, 'EEE'), // Day abbreviation for display
      revenue: d.revenue
    }
  })

  // Calculate dynamic Y-axis domain based on actual data
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 0)
  const minRevenue = Math.min(...chartData.map(d => d.revenue), 0)
  
  // Add padding to Y-axis (10% above max, round to nice number)
  let yAxisMax = maxRevenue * 1.1
  // Round up to nearest nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(yAxisMax)))
  yAxisMax = Math.ceil(yAxisMax / magnitude) * magnitude
  
  const yAxisMin = 0 // Always start from 0 for revenue charts

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="revenue-chart">
      <h3 className="chart-title">Daily Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dateIndex"
            type="number"
            scale="linear"
            domain={[0, chartData.length - 1]}
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: 700 }}
            tick={{ fill: '#6b7280', fontWeight: 700 }}
            tickFormatter={(value) => {
              const item = chartData[value]
              return item ? item.dateLabel : ''
            }}
            ticks={chartData.map((_, index) => index)}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: 700 }}
            tick={{ fill: '#6b7280', fontWeight: 700 }}
            domain={[yAxisMin, yAxisMax]}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
