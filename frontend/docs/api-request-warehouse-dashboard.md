# Warehouse Dashboard API Requests

To fully power the Warehouse Dashboard, we require the following endpoints for aggregated data.

## 1. Warehouse Summary Stats
**Endpoint**: `GET /v1/warehouse/dashboard/stats`

**Description**: High-level metrics for the dashboard.

**Response**:
```json
{
  "success": true,
  "data": {
    "total_warehouses": 5,
    "active_warehouses": 5,
    "total_inventory_value": 1500000,
    "total_stock_items": 12500,
    "low_stock_alerts": 12,
    "utilization_rate": 78
  }
}
```

## 2. Stock Distribution
**Endpoint**: `GET /v1/warehouse/dashboard/distribution`

**Description**: Inventory value or count distribution by warehouse.

**Response**:
```json
{
  "success": true,
  "data": [
    { "warehouse_name": "Main Warehouse", "value": 800000, "item_count": 5000 },
    { "warehouse_name": "Cold Storage", "value": 400000, "item_count": 2000 },
    { "warehouse_name": "Chemical Store", "value": 300000, "item_count": 1500 }
  ]
}
```

## 3. Capacity Utilization (Optional)
**Endpoint**: `GET /v1/warehouse/dashboard/utilization`

**Description**: Current capacity usage per warehouse.

**Response**:
```json
{
  "success": true,
  "data": [
    { "warehouse_name": "Main Warehouse", "capacity": 10000, "used": 8000, "percentage": 80 },
    { "warehouse_name": "Cold Storage", "capacity": 5000, "used": 2000, "percentage": 40 }
  ]
}
```
