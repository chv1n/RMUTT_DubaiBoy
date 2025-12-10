# Dashboard API Request

To optimize the Dashboard performance and avoid heavy client-side aggregation, we request the following dedicated endpoints.

## 1. Dashboard Summary Stats
**Endpoint**: `GET /v1/dashboard/stats`

**Description**: returns high-level metrics for the top cards.

**Response**:
```json
{
  "success": true,
  "data": {
    "total_inventory_value": 1500000,
    "total_materials_count": 120,
    "active_materials_count": 115,
    "low_stock_count": 5,
    "turnover_rate": 4.5, // Average turnover rate
    "trends": {
        "value_change": 5.2, // % change vs last month
        "material_count_change": 2, // new items
        "turnover_change": -0.5
    }
  }
}
```

## 2. Inventory Value Distribution
**Endpoint**: `GET /v1/dashboard/value-distribution`

**Description**: Returns inventory value grouped by Material Group.

**Response**:
```json
{
  "success": true,
  "data": [
    { "group_name": "Electronics", "value": 500000, "color": "#6366f1" },
    { "group_name": "Chemicals", "value": 300000, "color": "#10b981" }
    // ...
  ]
}
```

## 3. Movement Trends
**Endpoint**: `GET /v1/dashboard/movement-trends`

**Description**: Returns daily/weekly IN/OUT volumes.

**Query Params**: `range` (7d, 30d, 1y)

**Response**:
```json
{
  "success": true,
  "data": [
    { "date": "2023-10-01", "in_qty": 500, "out_qty": 300 },
    { "date": "2023-10-02", "in_qty": 200, "out_qty": 400 }
  ]
}
```
