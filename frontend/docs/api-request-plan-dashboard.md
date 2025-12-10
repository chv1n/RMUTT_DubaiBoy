# Plan Dashboard API Specification

เอกสารอธิบาย API สำหรับหน้า Plan Dashboard (แดชบอร์ดแผนการผลิต)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Plan Summary Stats

ดึงข้อมูลสถิติภาพรวมของแผนการผลิต เช่น จำนวนแผนทั้งหมด, สถานะต่างๆ, เป้าหมายการผลิตรวม, และอัตราการส่งมอบตรงเวลา

## 📌 Endpoint
`GET /product-plans/dashboard/stats`

## 🧪 Example Request
`GET http://localhost:3000/product-plans/dashboard/stats`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": {
    "total_plans": 15,
    "active_plans": 8,
    "completed_plans": 4,
    "pending_plans": 3,
    "total_production_target": 50000,
    "on_time_rate": 92.5,
    "trend": {
        "active_plans": "+2",
        "on_time_rate": "+1.5%"
    }
  }
}
```

---

# 2. Production Progress

ดึงข้อมูลความคืบหน้าของแผนการผลิตที่กำลังดำเนินการอยู่ (Active Plans)

## 📌 Endpoint
`GET /product-plans/dashboard/progress`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| limit | number | จำนวนแผนที่ต้องการแสดง (default=5) |

## 🧪 Example Request
`GET http://localhost:3000/product-plans/dashboard/progress?limit=5`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": [
    { 
        "plan_id": 101,
        "plan_name": "Q1 Production", 
        "target": 10000, 
        "produced": 8500, 
        "status": "IN_PROGRESS",
        "progress_percent": 85,
        "due_date": "2024-03-31"
    },
    { 
        "plan_id": 102,
        "plan_name": "Special Order A", 
        "target": 5000, 
        "produced": 5000, 
        "status": "COMPLETED",
        "progress_percent": 100,
        "due_date": "2024-03-15"
    },
    { 
        "plan_id": 103,
        "plan_name": "New Line Launch", 
        "target": 2000, 
        "produced": 200, 
        "status": "PENDING",
        "progress_percent": 10,
        "due_date": "2024-04-01"
    }
  ]
}
```

---

# 3. Plans by Status

ดึงข้อมูลการกระจายตัวของแผนการผลิตแยกตามสถานะ เพื่อแสดงผลในรูปแบบ Pie Chart หรือ Donut Chart

## 📌 Endpoint
`GET /product-plans/dashboard/status-distribution`

## 🧪 Example Request
`GET http://localhost:3000/product-plans/dashboard/status-distribution`

## ✅ Success Response
```json
{
  "success": true,
  "message": "สำเร็จ",
  "data": [
    { "name": "Pending", "value": 3, "color": "#f59e0b" },
    { "name": "In Progress", "value": 8, "color": "#10b981" },
    { "name": "Completed", "value": 4, "color": "#6366f1" },
    { "name": "Cancelled", "value": 0, "color": "#ef4444" }
  ]
}
```
