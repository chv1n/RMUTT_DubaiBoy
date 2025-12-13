# Product Plan Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard ของแผนการผลิต (Product Plan) เพื่อติดตามสถานะและความคืบหน้า

---

# 1. Plan Stats

ดึงข้อมูลสถิติภาพรวมของแผนการผลิต เช่น จำนวนแผนทั้งหมด, แผนที่กำลังดำเนินการ, แผนที่ล่าช้า

## 📌 Endpoint
`GET /product-plans/dashboard/stats`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "total_plans": 20,
        "active_plans": 5,
        "completed_plans": 12,
        "delayed_plans": 3,
        "on_time_rate": 80.0
    }
}
```

---

# 2. Plan Progress

ดึงข้อมูลความคืบหน้าของแผนการผลิตล่าสุด

## 📌 Endpoint
`GET /product-plans/dashboard/progress`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| limit | number | No | จำนวนรายการที่ต้องการดึง (Default: 5) |

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "plan_id": 101,
            "plan_name": "Project A",
            "progress": 75,
            "status": "IN_PROGRESS",
            "due_date": "2023-12-31"
        }
    ]
}
```

---

# 3. Status Distribution

ดึงข้อมูลการกระจายตัวของสถานะแผนการผลิต

## 📌 Endpoint
`GET /product-plans/dashboard/status-distribution`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        { "status": "PENDING", "count": 2, "color": "#fbbf24" },
        { "status": "IN_PROGRESS", "count": 5, "color": "#3b82f6" },
        { "status": "COMPLETED", "count": 12, "color": "#10b981" }
    ]
}
```
