/**
 * Simple CSV fetcher - no API logic, just file serving
 */

const API_BASE = '/api/data'

export async function fetchCSV<T>(filename: string): Promise<T[]> {
  try {
    const response = await fetch(`${API_BASE}/${filename}`)
    if (!response.ok) throw new Error(`Failed to fetch ${filename}`)
    
    const text = await response.text()
    return parseCSV<T>(text)
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error)
    return []
  }
}

export async function saveCSV(filename: string, data: any[]): Promise<boolean> {
  try {
    const csv = convertToCSV(data)
    const response = await fetch(`/api/save/${filename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv })
    })
    return response.ok
  } catch (error) {
    console.error(`Error saving ${filename}:`, error)
    return false
  }
}

export function parseCSV<T>(csv: string): T[] {
  const lines = csv.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    // Handle CSV values that may be quoted - proper CSV parsing
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''))
    
    const obj: any = {}
    headers.forEach((header, i) => {
      const value = values[i] || ''
      if (header === 'order_id' || header.includes('count') || header.includes('quantity') || header.includes('stock') || header.includes('threshold')) {
        obj[header] = value ? parseInt(value, 10) : 0
      } else if (header === 'revenue' || header === 'price') {
        // Remove $ and commas, then parse
        const cleanValue = value.replace(/[$,]/g, '')
        obj[header] = cleanValue ? parseFloat(cleanValue) : 0
      } else {
        obj[header] = value
      }
    })
    return obj as T
  })
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header] ?? ''
      return `"${value}"`
    }).join(',')
  )
  
  return [headers.join(','), ...rows].join('\n')
}

