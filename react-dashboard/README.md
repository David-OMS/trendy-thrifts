# Trendy Thrifts React Dashboard

Modern React/TypeScript dashboard for visualizing sales and inventory data.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy CSV files to `public/` folder:
- Orders_Clean.csv
- Daily_Revenue.csv
- Channel_Performance.csv
- Product_Performance.csv
- Alerts.csv
- Inventory_Status.csv

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

- Interactive charts (Revenue over time, by channel, top products)
- KPI cards (Total revenue, orders fulfilled/pending/cancelled)
- Alerts panel with color-coded severity
- Inventory status table
- Filters (date range, channel)
- Responsive design

## Tech Stack

- React 18
- TypeScript
- Vite
- Recharts (for charts)
- date-fns (for date formatting)

