# Product Dashboard API Requests

To support the Product Dashboard, we require the following aggregated data endpoints.

## 1. Product Summary Stats
**Endpoint**: `GET /v1/products/dashboard/stats`

**Description**: High-level metrics for the dashboard.

**Response**:
```json
{
  "success": true,
  "data": {
    "total_products": 150,
    "active_products": 142,
    "new_products_this_month": 5,
    "top_category_name": "Electronics",
    "avg_cost": 450.00
  }
}
```

## 2. Category Distribution
**Endpoint**: `GET /v1/products/dashboard/distribution`

**Description**: Count of products per product type.

**Response**:
```json
{
  "success": true,
  "data": [
    { "type_name": "Electronics", "count": 50, "percentage": 33.3 },
    { "type_name": "Mechanical", "count": 40, "percentage": 26.6 },
    { "type_name": "Packaging", "count": 60, "percentage": 40.0 }
  ]
}
```

## 3. Product Cost Trends
**Endpoint**: `GET /v1/products/dashboard/cost-trends`

**Description**: Trend of average BOM cost over time.

**Response**:
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "avg_cost": 420 },
    { "month": "Feb", "avg_cost": 430 },
    { "month": "Mar", "avg_cost": 450 }
  ]
}
```
