# Inventory Dashboard API Specification

เอกสารอธิบาย API สำหรับหน้า Inventory Dashboard (แดชบอร์ดคลังสินค้า)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Inventory Summary Stats

ดึงข้อมูลสถิติภาพรวมของสินค้าคงคลัง เช่น มูลค่ารวม, จำนวนรายการในสต็อก, รายการที่เหลือน้อย, และการเคลื่อนไหวประจำวัน

## 📌 Endpoint
`GET /inventory/dashboard/stats`

## 🧪 Example Request
`GET http://localhost:3000/inventory/dashboard/stats`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": {
    "total_inventory_value": 2500000,
    "currency": "THB",
    "total_items_in_stock": 15000,
    "low_stock_items": 12,
    "out_of_stock_items": 5,
    "movement_in_today": 350,
    "movement_out_today": 120,
    "trends": {
        "value": "+2.5%",
        "movement_in": "+10%",
        "movement_out": "-5%"
    }
  }
}
```

---

# 2. Stock Value Trends

ดึงข้อมูลแนวโน้มมูลค่าสินค้าคงคลังตามช่วงเวลาที่กำหนด

## 📌 Endpoint
`GET /inventory/dashboard/value-trends`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| range | string | ช่วงเวลา (e.g., '1m', '3m', '6m', '1y') (default='1m') |

## 🧪 Example Request
`GET http://localhost:3000/inventory/dashboard/value-trends?range=1m`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": [
    { "date": "2023-11-01", "value": 2400000 },
    { "date": "2023-11-08", "value": 2450000 },
    { "date": "2023-11-15", "value": 2480000 },
    { "date": "2023-11-22", "value": 2500000 }
  ]
}
```

---

# 3. Stock Movement

ดึงข้อมูลสรุปการเคลื่อนไหวสินค้า (Inbound/Outbound) เพื่อเปรียบเทียบ

## 📌 Endpoint
`GET /inventory/dashboard/movement`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| range | string | ช่วงเวลา (e.g., 'week', 'month') (default='week') |

## 🧪 Example Request
`GET http://localhost:3000/inventory/dashboard/movement?range=week`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": {
    "inbound": [
        { "name": "Mon", "value": 100 },
        { "name": "Tue", "value": 120 },
        { "name": "Wed", "value": 150 },
        { "name": "Thu", "value": 80 },
        { "name": "Fri", "value": 200 }
    ],
    "outbound": [
        { "name": "Mon", "value": 80 },
        { "name": "Tue", "value": 90 },
        { "name": "Wed", "value": 100 },
        { "name": "Thu", "value": 120 },
        { "name": "Fri", "value": 150 }
    ]
  }
}
```
