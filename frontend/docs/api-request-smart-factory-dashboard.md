# Smart Factory Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard หน้าแรก (Smart Factory) เพื่อตอบโจทย์การบริหารจัดการทรัพยากรและการผลิตแบบ Real-time

---

# 1. KPI Summary (การ์ดตัวเลขสำคัญ)

ดึงข้อมูลตัวเลขสรุปผลการดำเนินงานสำหรับผู้บริหาร (Executive Summary)

## 📌 Endpoint
`GET /dashboard/smart/stats`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "total_materials": 1250,            // จำนวน material ทั้งหมดในระบบ
        "low_stock_materials": 45,          // จำนวน material ที่ต่ำกว่า reorder point
        "critical_alerts": 12,              // จำนวนวัสดุที่ต่ำกว่าจุดวิกฤต (is_critical = true)
        "total_stock_value": 4500000.00,    // มูลค่าคงคลังรวม (฿)
        "active_production_plans": 8        // จำนวนแผนผลิตที่กำลัง IN_PROGRESS
    }
}
```

---

# 2. Top Low Stock Materials (อันดับ Material ใกล้หมด)

ดึงรายการวัสดุที่มีความเสี่ยงสูงสุด 10 อันดับแรก เพื่อใช้เป็น To-do list ประจำวัน

## 📌 Endpoint
`GET /dashboard/smart/low-stock`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| limit | number | No | จำนวนรายการที่ต้องการดึง (Default: 10) |

## ✅ Success Response
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
            "shortage_qty": 50,             // reorder_point - current_qty
            "unit": "pcs",
            "status": "CRITICAL"            // CRITICAL, WARNING
        },
        {
            "material_id": 204,
            "material_name": "Steel Sheet",
            "warehouse": "Zone A",
            "current_qty": 120,
            "reorder_point": 150,
            "shortage_qty": 30,
            "unit": "sheets",
            "status": "WARNING"
        }
    ]
}
```

---

# 3. Critical Alerts & Notifications

การแจ้งเตือนแบบ Real-time เรียงตามความรุนแรง (Severity)

## 📌 Endpoint
`GET /dashboard/smart/alerts`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 1,
            "type": "SHORTAGE",             // SHORTAGE, EXPIRY, PLAN_RISK
            "severity": "HIGH",             // HIGH, MEDIUM, LOW
            "message": "Plan Q1-TV – Material not enough",
            "details": "Missing: Screw 5mm (90 pcs)",
            "timestamp": "2024-12-14T10:00:00Z"
        },
        {
            "id": 2,
            "type": "EXPIRY",
            "severity": "MEDIUM",
            "message": "Chemical A – Expire in 7 days",
            "details": "Batch #B402, Qty: 50kg",
            "timestamp": "2024-12-14T09:30:00Z"
        },
        {
            "id": 3,
            "type": "SHORTAGE",
            "severity": "MEDIUM",
            "message": "Screw 5mm – Shortage 90 pcs (Main WH)",
            "details": "Reorder immediately",
            "timestamp": "2024-12-14T08:00:00Z"
        }
    ]
}
```

---

# 4. Smart Charts (กราฟวิเคราะห์)

ดึงข้อมูลสำหรับกราฟต่างๆ ในหน้า Dashboard

## 📌 Endpoint
`GET /dashboard/smart/charts`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| type | string | Yes | ประเภทกราฟ (`stock_trend`, `top_consumption`, `inventory_turnover`) |
| range | string | No | ช่วงเวลา (`7d`, `30d`, `90d`) (Default: `30d`) |

## ✅ Success Response (Example: stock_trend)
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "title": "Stock Value Trend (Last 30 Days)",
        "label": "Total Value (THB)",
        "datasets": [
            { "date": "2023-10-01", "value": 1400000 },
            { "date": "2023-10-02", "value": 1450000 },
            { "date": "2023-10-03", "value": 1380000 }
        ]
    }
}
```

## ✅ Success Response (Example: top_consumption)
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        { "material_name": "Steel Bar", "consumption_qty": 5000, "unit": "kg" },
        { "material_name": "Plastic Resin", "consumption_qty": 3200, "unit": "kg" }
    ]
}
```

---

# 5. Production Plan Impact (Plans at Risk)

ตรวจสอบความเสี่ยงของแผนการผลิตเทียบกับวัสดุคงคลังที่มีอยู่จริง

## 📌 Endpoint
`GET /dashboard/smart/plans-at-risk`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "plan_id": 101,
            "plan_name": "Plan Q1-TV",
            "product_name": "Smart TV 55 Inch",
            "risk_materials": [
                {
                    "material_name": "Panel LED",
                    "required_qty": 100,
                    "available_qty": 80,
                    "status": "BLOCKED"      // RISK, BLOCKED
                },
                {
                    "material_name": "Mainboard V2",
                    "required_qty": 100,
                    "available_qty": 95,
                    "status": "RISK"
                }
            ],
            "overall_status": "BLOCKED",
            "start_date": "2024-12-20"
        }
    ]
}
```
