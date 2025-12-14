# Main Dashboard API Specification

Base URL: `/api/v1/dashboard` (Depending on global prefix, controller path is `dashboard`)

## 1. Get Overview Stats
ดึงข้อมูลภาพรวมของระบบทั้งหมด (Users, Materials, Plans, Inventory)

**Endpoint:** `GET /dashboard/overview`

**Query Parameters:**
| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| range | string | No | 'month' | Period range (e.g., 'month', 'week') |

**Response Example:**
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": {
    "users": { "total": 100, "active": 80, ... },
    "materials": { "total": 500, "lowStock": 10, ... },
    "plans": { "active": 5, "completed": 20, ... },
    "inventory": { "totalValue": 1000000, ... },
    "alerts": [ ... ],
    "systemPerformance": [ ... ]
  }
}
```

---

## 2. Get Smart Factory Stats (KPI)
ดึง KPI สำคัญสำหรับ Smart Factory Dashboard

**Endpoint:** `GET /dashboard/smart/stats`

**Query Parameters:** None

**Response Example:**
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": {
    "total_materials": 1250,
    "low_stock_materials": 45,
    "critical_alerts": 12,
    "total_stock_value": 4500000.00,
    "active_production_plans": 8
  }
}
```

---

## 3. Get Low Stock Materials
ดึงรายการวัสดุที่ใกล้หมด (ต่ำกว่า min stock)

**Endpoint:** `GET /dashboard/smart/low-stock`

**Query Parameters:**
| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| limit | number | No | 10 | จำนวนรายการสูงสุดที่ต้องการดึง |

**Response Example:**
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": [
    {
      "material_id": 101,
      "material_name": "Screw 5mm",
      "warehouse": "Main WH",
      "current_qty": 50,
      "reorder_point": 100,
      "shortage_qty": 50,
      "unit": "pcs",
      "status": "CRITICAL"
    }
  ]
}
```

---

## 4. Get Smart Alerts
ดึงการแจ้งเตือนทั้งหมด (Shortage, Expiry, Plan Risk) เรียงตามความรุนแรง

**Endpoint:** `GET /dashboard/smart/alerts`

**Query Parameters:** None

**Response Example:**
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": [
    {
      "id": 1,
      "type": "SHORTAGE",
      "severity": "HIGH",
      "message": "Screw 5mm – Shortage 50 pcs",
      "details": "Reorder immediately. Current: 50",
      "timestamp": "2024-12-14T10:00:00Z"
    }
  ]
}
```

---

## 5. Get Smart Charts
ดึงข้อมูลสำหรับกราฟต่างๆ

**Endpoint:** `GET /dashboard/smart/charts`

**Query Parameters:**
| Name | Type | Required | Description |
|---|---|---|---|
| type | string | Yes | ประเภทกราฟ (`stock_trend`, `top_consumption`, `inventory_turnover`) |
| range | string | No | ช่วงเวลา (e.g. `30d`, `7d`) Default: `30d` |

**Response Example (stock_trend):**
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": {
    "title": "Stock Value Trend (Last 30d)",
    "label": "Total Value (THB)",
    "datasets": [
      { "date": "2023-10-01", "value": 1400000 },
      ...
    ]
  }
}
```

---

## 6. Get Plans at Risk
ตรวจสอบแผนการผลิตที่มีความเสี่ยงเนื่องจากวัตถุดิบไม่พอ

**Endpoint:** `GET /dashboard/smart/plans-at-risk`

**Query Parameters:** None

**Response Example:**
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": [
    {
      "plan_id": 101,
      "plan_name": "Plan A",
      "product_name": "Product X",
      "risk_materials": [
        {
          "material_name": "Part Y",
          "required_qty": 100,
          "available_qty": 80,
          "status": "RISK"
        }
      ],
      "overall_status": "RISK",
      "start_date": "2024-12-20"
    }
  ]
}
```
