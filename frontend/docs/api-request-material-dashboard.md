# Material Dashboard API Specification

เอกสารอธิบาย API สำหรับหน้า Material Dashboard (แดชบอร์ดจัดการวัสดุ)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Material Summary Stats

ดึงข้อมูลสถิติภาพรวมของวัสดุ (Material) เช่น มูลค่าสินค้าคงคลังรวม, จำนวนรายการวัสดุ, รายการที่เหลือน้อย, และอัตราการหมุนเวียน

## 📌 Endpoint
`GET /materials/dashboard/stats`

## 🧪 Example Request
`GET http://localhost:3000/materials/dashboard/stats`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": {
    "total_inventory_value": 1500000,
    "currency": "THB",
    "total_materials_count": 120,
    "active_materials_count": 115,
    "low_stock_count": 5,
    "out_of_stock_count": 2,
    "turnover_rate": 4.5,
    "trends": {
        "value_change": 5.2,
        "material_count_change": 2,
        "turnover_change": -0.5
    }
  }
}
```

---

# 2. Inventory Value Distribution

ดึงข้อมูลการกระจายมูลค่าสินค้าคงคลังแยกตามกลุ่มวัสดุ (Material Group)

## 📌 Endpoint
`GET /materials/dashboard/value-distribution`

## 🧪 Example Request
`GET http://localhost:3000/materials/dashboard/value-distribution`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": [
    { "group_name": "Electronics", "value": 500000, "percentage": 33.3, "color": "#6366f1" },
    { "group_name": "Chemicals", "value": 300000, "percentage": 20.0, "color": "#10b981" },
    { "group_name": "Metals", "value": 700000, "percentage": 46.7, "color": "#f59e0b" }
  ]
}
```

---

# 3. Material Movement Trends

ดึงข้อมูลแนวโน้มการเคลื่อนไหวของวัสดุ (เข้า/ออก) ในช่วงเวลาที่กำหนด

## 📌 Endpoint
`GET /materials/dashboard/movement-trends`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| range | string | ช่วงเวลา (e.g., '7d', '30d', '1y') (default='7d') |

## 🧪 Example Request
`GET http://localhost:3000/materials/dashboard/movement-trends?range=30d`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": [
    { "date": "2023-10-01", "in_qty": 500, "out_qty": 300, "net_change": 200 },
    { "date": "2023-10-02", "in_qty": 200, "out_qty": 400, "net_change": -200 },
    { "date": "2023-10-03", "in_qty": 100, "out_qty": 50, "net_change": 50 }
  ]
}
```
