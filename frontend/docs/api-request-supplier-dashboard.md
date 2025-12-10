# Supplier Dashboard API Requests

To fully power the Supplier Dashboard with real-time analytics without expensive client-side aggregation, we request the following endpoints.

## 1. Supplier Summary Stats
**Endpoint**: `GET /v1/suppliers/stats/summary`

**Description**: High-level KPI metrics.

**Response**:
```json
{
  "success": true,
  "data": {
    "total_suppliers": 120,
    "active_suppliers": 115,
    "active_suppliers_trend": 5.2, // % change vs last month
    "total_spend_ytd": 1500000,
    "total_spend_trend": 10.5,
    "open_orders_count": 45,
    "open_orders_trend": -2.0,
    "issues_count": 3
  }
}
```

## 2. Spending Analytics
**Endpoint**: `GET /v1/suppliers/stats/spending`

**Query Params**: `type` (monthly, category)

**Response (Monthly)**:
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "amount": 150000 },
    { "month": "Feb", "amount": 230000 }
  ]
}
```

**Response (Category)**:
```json
{
  "success": true,
  "data": [
    { "category": "Electronics", "amount": 500000, "percentage": 35 },
    { "category": "Construction", "amount": 350000, "percentage": 25 }
  ]
}
```

## 3. Top Suppliers
**Endpoint**: `GET /v1/suppliers/stats/top-performing`

**Description**: Suppliers ranked by spend or rating.

**Response**:
```json
{
  "success": true,
  "data": [
     {
        "supplier_id": 1,
        "supplier_name": "ABC Corp",
        "total_spent": 500000,
        "rating": 4.5,
        "status": "active"
     }
  ]
}
```
