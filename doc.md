# RMUTT DubaiBoy - System Documentation

## 📖 Introduction
RMUTT DubaiBoy is a comprehensive Manufacturing Resource Planning (MRP) and Inventory Management System designed to streamline production, inventory control, and forecasting.

---

## 🚀 Key Features

### 1. 📊 Main Dashboard
Real-time overview of the entire operation.
- **Key Metrics**: User Activity, Material Health, Production Plan Status, Inventory Value.
- **Dynamic Alerts**: Low stock warnings, production delays (On-Time Rate), critical inventory levels.

### 2. 👥 User Management (`/users`)
Role-based access control system.
- **Roles**: Admin, Manager, Staff.
- **Features**: User Dashboard, Create/Edit Users, Activity Logs (Audit Trail).

### 3. 📦 Master Data Management
- **Product Management (`/products`)**: Define finished goods, assign categories, and manage pricing.
- **Material Management (`/materials`)**: Raw material catalog, reorder points, and lead times.
- **Bill of Materials (BOM) (`/boms`)**: Define recipes for products (Child Materials -> Parent Product).
- **Suppliers (`/suppliers`)**: Manage vendor information and sourcing.
- **Warehouses (`/warehouses`)**: Multi-warehouse support.

### 4. 🏭 Production Planning (`/product-plans`)
Manage the manufacturing lifecycle.
- **Plan Creation**: Set production targets by date and product.
- **Status Tracking**: Pending -> In Progress -> Completed.
- **Analytics**: Track "On-Time Delivery" rates and production efficiency.

### 5. 🏗 Inventory Management (`/inventory`)
Track stock movement and valuation in real-time.
- **Stock Balance**: View current quantity on hand across all warehouses.
- **Transactions**: Log Inbound (Receipts) and Outbound (Issues/Sales) movements.
- **Valuation**: Real-time calculation of Total Inventory Value (THB).
- **Low Stock Alerts**: Automatic flagging of items below safety stock.

### 6. 📈 Forecasting (`/forecast`)
Predict future demand to optimize inventory.
- **Demand Planning**: View historical usage and predict future material needs.
- **Analytics**: Visualization of consumption trends.

---

## 🎬 Demo Scenarios

Use these flows to demonstrate the system capabilities:

### Scenario A: New Product Launch
1. **Define Material**: Create new raw materials (e.g., "Special Fabric").
2. **Define Product**: Create a new finished good (e.g., "Summer Shirt").
3. **Create BOM**: Link "Special Fabric" to "Summer Shirt" with usage quantity.

### Scenario B: Procurement to Production
1. **Check Inventory**: See "Special Fabric" is Low Stock on Dashboard.
2. **Inbound Stock**: Record receipt of "Special Fabric" from Supplier.
3. **Create Plan**: Schedule production for 500 "Summer Shirts".
4. **Update Status**: Move plan to "Completed".
5. **Check Inventory**: Verify "Special Fabric" was deducted (Backflush) or manually issued.

### Scenario C: Management Overview
1. Open **Main Dashboard**.
2. Show **Financials**: Inventory Value trend.
3. Show **Operations**: Production On-Time Rate.
4. Show **Audit Log**: Trace who created the new plans.

---

## 🛠 Tech Stack
- **Backend**: NestJS, TypeORM, PostgreSQL.
- **Frontend**: Next.js / React (implied).
- **Authentication**: JWT Strategy.

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis (Optional, for advanced caching)

### 1. Backend Setup
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the `backend` directory (copy from `.env.example` if available) and configure your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=rmutt_dubaiboy
```

#### Database Migration & Seeding
```bash
# Run migrations
npm run migration:run

# Seed initial data
npm run seed
```

#### Start Server
```bash
npm run start:dev
# Server running at http://localhost:3000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3001
```
