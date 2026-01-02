# Trendy Thrifts

## 🚀 Live Demo

**Live Application:** [https://trendy-thrifts-vercel.vercel.app/](https://trendy-thrifts-vercel.vercel.app/) - Order & Inventory Management System

A complete order and inventory management system built for a small e-commerce business. This project solves real operational challenges through automation, real-time tracking, and data-driven insights.

## Chalenge

Trendy Thrifts operates across four sales channels: their website, Instagram, WhatsApp, and Facebook. While this multi-channel approach helps reach more customers, it created significant operational challenges.

**Order Management Issues**
- Orders from different channels were manually entered into separate spreadsheets
- Orders were frequently missed, duplicated, or entered with incorrect information
- No centralized system to track order status changes
- Staff would mark orders as "pending" but forget to update when fulfilled, leading to duplicate entries

**Inventory Tracking Problems**
- Products were oversold regularly - customers would order items that weren't actually in stock
- Manual inventory counts were error-prone and often forgotten
- No visibility into which products needed restocking
- Stockouts happened without warning, leading to customer complaints and refunds

**Lack of Business Intelligence**
- Management had no visibility into which products were most profitable
- Couldn't determine which sales channels performed best
- No revenue tracking or trend analysis
- Business decisions were made based on assumptions rather than data

**Technical Limitations**
- Multiple Excel spreadsheets with inconsistent data
- Formulas breaking when data was entered incorrectly
- No automation - every process required manual work
- Staff spent significant time on data entry 

## The Solution

I built a database-first system that automates order processing, inventory tracking, and analytics. The system consists of three main components working together.

### Architecture

**Database Layer**
The system uses SQLite as the primary data store. All orders and inventory updates write to the database first, ensuring fast performance and data integrity. The database serves as the single source of truth.

**Processing Pipeline**
Python scripts run automatically in the background, processing raw order data to calculate:
- Current inventory levels based on fulfilled orders
- Revenue metrics (daily, weekly, monthly)
- Channel and product performance analytics
- Alert generation for low stock and order issues

**User Interface**
- **Form Interface**: A React-based form for staff to enter orders. Uses button-based selection to minimize errors - no typing product names or IDs. Order status updates modify existing records rather than creating duplicates.
- **Analytics Dashboard**: A real-time dashboard showing revenue, channel performance, top products, and inventory status. Updates automatically as new orders come in.

**Cloud Integration**
Google Sheets integration provides cloud access. The database syncs to Google Sheets in the background, allowing the owner to check inventory and orders from anywhere. The sync is asynchronous, so slow API calls don't block the main system.

### Key Features

**Unified Order Management**
All orders from all channels flow into a single system. The system automatically prevents duplicates and tracks order status changes. When an order moves from "pending" to "fulfilled", it updates the existing record rather than creating a new one. Each order has a unique ID, eliminating the need to manually reconcile multiple spreadsheets.

**Automated Inventory Tracking**
Inventory is calculated automatically from fulfilled orders only - pending or cancelled orders do not affect stock. Stock levels are always derived from the database, ensuring accuracy and auditability. The system tracks current stock, identifies when items reach reorder thresholds, and flags oversold situations immediately.

**Prevents Overselling During Order Entry**
Staff select products using buttons instead of typing them manually, reducing errors. Current stock levels are visible while entering orders. Products with insufficient stock are indicated and cannot be selected. Some products may show zero or negative stock values to reflect overselling that occurred prior to introducing this system - these values are preserved for historical context.

**Proactive Alert System**
The system monitors inventory levels and generates alerts:
- High-priority alerts when stock reaches or falls below reorder threshold
- Critical alerts for oversold items
- Warnings for pending orders that may cause inventory issues
- Approaching threshold warnings when stock is getting low (within 2x threshold)

Alerts are color-coded by severity (High/Medium/Low) and appear in both the dashboard and Google Sheets.

**Business Intelligence & Analytics**
The dashboard calculates and displays:
- Revenue trends (daily, weekly, monthly)
- Revenue by sales channel
- Top-selling products
- Current inventory status
- Order counts by status (fulfilled, pending, cancelled)

Analytics are displayed in a React dashboard, updated asynchronously as orders are entered, providing immediate visibility into operations.

## Business Impact

**Operational Improvements**
- Eliminated order errors through automated deduplication and validation
- Prevents overselling with real-time inventory tracking and stock validation
- Significantly reduced data entry time through button-based interface (no typing product names
- Enabled remote access to business data via Google Sheets

**Strategic Benefits**
- Data-driven decision making - can now identify which products and channels drive revenue
- Proactive inventory management - alerts warn about low stock before running out
- Scalable system that can handle business growth without additional staff
- Professional operations with real-time visibility into business metrics

**Measurable Results**
- Zero order duplication errors through automated deduplication
- Prevents overselling with stock validation blocking invalid orders
- Significant reduction in data entry time through button-based interface
- Complete visibility into all business metrics
- Real-time inventory accuracy
- Automated alert generation for operational issues

## Technical Implementation

**Technology Stack**
- Backend: Node.js with Express for the API server
- Database: SQLite for fast, reliable data storage
- Frontend: React with TypeScript for the form and dashboard
- Data Processing: Python with pandas for analytics
- Cloud Integration: Google Sheets API for remote access

**System Flow**
```
Order Entry (React Form)
    ↓
API (Node.js / Express) - instant write
    ↓
SQLite Database (source of truth)
    ↓
Background Sync Service (async)
    ├─→ CSV Files (for Python scripts)
    ├─→ Google Sheets (for cloud access)
    └─→ Python Scripts
        ├─→ Inventory calculations
        ├─→ Revenue analytics
        ├─→ Alert generation
        └─→ Processed Data → Dashboard + Google Sheets
```

**Design Decisions & Tradeoffs**

**Database-First Architecture**
- SQLite chosen for simplicity and reliability at current scale
- All writes go to database first for speed and data integrity
- Background sync to CSV/Sheets doesn't block operations
- Can scale to PostgreSQL or other databases if higher concurrency is needed

**Manual Order Entry vs Channel Automation**
- Button-based UI keeps workflows familiar for staff
- Prevents overselling with real-time stock validation
- Future enhancement: Can be made fully automated with direct channel integration when needed

**Batch Analytics vs Real-Time Processing**
- Python scripts run asynchronously after database updates
- Current approach provides excellent performance and maintainability
- Can be enhanced to fully real-time processing where necessary for specific use cases

**Preserving Historical Oversells**
- Products with negative stock from before system introduction are preserved for historical accuracy
- Maintains complete historical context
- New orders cannot be created for oversold items - system prevents future overselling
- Historical data remains intact while preventing new issues

**UI Enforcement vs Backend Enforcement**
- Frontend prevents mistakes during order entry (disabled buttons, validation)
- Backend validates all writes for data integrity
- Dual-layer validation ensures both excellent user experience and data integrity

**Known Limitations & Future Improvements**
- Orders are manually entered; can be enhanced with direct channel API integration when needed
- Analytics run in batches; can be upgraded to fully real-time processing where necessary
- Role-based access control can be added for multi-user scenarios


## Live Demo

Experience the system in action:

**[Try the Live Demo →](https://trendy-thrifts-vercel.vercel.app/)**

The demo includes:
- Full order entry form with stock validation
- Real-time analytics dashboard
- Inventory management interface
- Alert system demonstration

All features are fully functional - enter test orders, update inventory, and see how the system tracks everything in real-time.


## What the System Tracks

**Order Data**
- All orders from all channels with complete status tracking (Pending, Fulfilled, Cancelled)
- Order details: product, quantity, price, channel, date, fulfillment status
- Automatic deduplication and status update tracking

**Inventory Data**
- Real-time inventory levels calculated from fulfilled orders
- Stock status: OK, WARNING (approaching threshold), LOW (at/below threshold), OVERSOLD
- Reorder threshold tracking and alerts
- Historical stock movements

**Analytics & Metrics**
- Revenue metrics (daily, weekly, monthly breakdowns)
- Channel performance (revenue by Website, Instagram, WhatsApp, Facebook)
- Product performance (top sellers, revenue per product, units sold)
- Order counts by status
- Inventory status across all products

**Operational Alerts**
- Low stock alerts (at or below reorder threshold)
- Approaching threshold warnings (within 2x threshold)
- Oversold inventory alerts
- Pending order risk warnings (when pending orders exceed available stock)

