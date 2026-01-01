import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ProductPerformance } from '../types'
import './ProductChart.css'

interface ProductChartProps {
  data: ProductPerformance[]
}

function ProductChart({ data }: ProductChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.quantity_sold - a.quantity_sold)
    .slice(0, 10)
    .reverse()

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-value">{payload[0].value} units</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="product-chart">
      <h3 className="chart-title">Top 10 Products</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="productGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: 700 }}
            tick={{ fill: '#6b7280', fontWeight: 700 }}
          />
          <YAxis 
            dataKey="product_name" 
            type="category" 
            width={120}
            stroke="#6b7280"
            style={{ fontSize: '11px', fontWeight: 700 }}
            tick={{ fill: '#6b7280', fontWeight: 700 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="quantity_sold" 
            fill="url(#productGradient)"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProductChart
