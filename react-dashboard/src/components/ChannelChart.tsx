import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { MessageCircle, Instagram, Globe } from 'lucide-react'
import { ChannelPerformance } from '../types'
import './ChannelChart.css'

interface ChannelChartProps {
  data: ChannelPerformance[]
}

function ChannelChart({ data }: ChannelChartProps) {
  const chartData = data.map(ch => ({
    name: ch.channel,
    value: ch.revenue,
    color: getChannelColor(ch.channel)
  }))

  const totalRevenue = data.reduce((sum, ch) => sum + ch.revenue, 0)

  // Smart formatter for currency values
  function formatChannelValue(value: number): string {
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="channel-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">{formatChannelValue(data.value)}</p>
        </div>
      )
    }
    return null
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return <MessageCircle size={20} />
      case 'Facebook': return <Globe size={20} /> // Using Globe as Facebook icon alternative
      case 'Instagram': return <Instagram size={20} />
      default: return <Globe size={20} />
    }
  }

  return (
    <div className="channel-chart">
      <h3 className="chart-title">Revenue by Channel</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="channel-legend">
        {data.map((channel) => {
          const percentage = ((channel.revenue / totalRevenue) * 100).toFixed(1)
          return (
            <div key={channel.channel} className="legend-item">
              <div className="legend-icon" style={{ backgroundColor: `${getChannelColor(channel.channel)}20` }}>
                {getChannelIcon(channel.channel)}
              </div>
              <div className="legend-content">
                <div className="legend-name">{channel.channel}</div>
                <div className="legend-value">
                  {formatChannelValue(channel.revenue)} ({percentage}%)
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getChannelColor(channel: string): string {
  switch (channel) {
    case 'WhatsApp': return '#25D366'
    case 'Facebook': return '#1877F2'
    case 'Instagram': return '#E4405F'
    default: return '#8b5cf6'
  }
}

export default ChannelChart
