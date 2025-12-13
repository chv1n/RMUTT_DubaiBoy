# Material Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard ของการจัดการวัสดุ (Material Dashboard) เพื่อแสดงภาพรวมและสถิติต่างๆ

---

# 1. Material Summary Stats

ดึงข้อมูลสถิติภาพรวมวัสดุ เช่น มูลค่าสินค้าคงคลังรวม, จำนวนวัสดุทั้งหมด, วัสดุจวนหมดสต็อก และอัตราการหมุนเวียนสินค้า

## 📌 Endpoint
`GET /materials/dashboard/stats`

## 📦 Parameters
None

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

ดึงข้อมูลการกระจายตัวของมูลค่าสินค้าคงคลัง แยกตามกลุ่มวัสดุ (Material Group)

## 📌 Endpoint
`GET /materials/dashboard/value-distribution`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "group_name": "Structure",
            "value": 500000,
            "percentage": 50.0,
            "color": "#6366f1"
        },
        {
            "group_name": "Electronics",
            "value": 300000,
            "percentage": 30.0,
            "color": "#10b981"
        },
        {
            "group_name": "Consumables",
            "value": 200000,
            "percentage": 20.0,
            "color": "#f59e0b"
        }
    ]
}
```

---

# 3. Movement Trends

ดึงข้อมูลแนวโน้มการเคลื่อนไหวของสต็อก (เข้า/ออก) ในช่วงเวลาที่กำหนด

## 📌 Endpoint
`GET /materials/dashboard/movement-trends`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| range | string | No | ช่วงเวลาที่ต้องการดึงข้อมูล: '7d', '30d', '1y' (Default: '7d') |

## 🧪 Example Request
`GET /materials/dashboard/movement-trends?range=30d`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "date": "2023-11-01",
            "in_qty": 100,
            "out_qty": 50,
            "net_change": 50
        },
        {
            "date": "2023-11-02",
            "in_qty": 0,
            "out_qty": 20,
            "net_change": -20
        }
    ]
}
```
