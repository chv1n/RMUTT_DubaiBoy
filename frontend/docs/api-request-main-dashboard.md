# Main Dashboard API Specification

เอกสารอธิบาย API สำหรับหน้า Main Dashboard (หน้าแรกของผู้ดูแลระบบ)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get Main Overview Stats

ดึงข้อมูลภาพรวมของระบบทั้งหมด เพื่อแสดงผลในหน้า Dashboard หลัก ประกอบด้วยข้อมูลผู้ใช้งาน, วัตถุดิบ, แผนการผลิต, สินค้าคงคลัง, และการแจ้งเตือนต่างๆ

## 📌 Endpoint
`GET /dashboard/overview`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| range | string | ช่วงเวลาที่ต้องการดูข้อมูล (e.g., 'today', 'week', 'month', 'year') (Optional, default='month') |

## 🧪 Example Request
`GET http://localhost:3000/dashboard/overview?range=month`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "users": {
            "total": 1250,
            "active": 1100,
            "inactive": 150,
            "change": 5.2,
            "trend": "up"
        },
        "materials": {
            "total": 567,
            "lowStock": 23,
            "outOfStock": 5,
            "active": 539,
             "change": 1.2
        },
        "plans": {
            "active": 12,
            "completed": 45,
            "totalTarget": 10000,
            "onTimeRate": 94.5,
            "trend": "stable"
        },
        "inventory": {
            "totalValue": 12500000,
            "currency": "THB",
            "inboundToday": 15,
            "outboundToday": 24,
            "movements": 1250
        },
        "alerts": [
            {
                "id": 1,
                "type": "warning",
                "message": "Low stock: Steel Sheet A4",
                "timestamp": "2024-03-10T10:15:00Z",
                "link": "/materials/1"
            },
            {
                "id": 2,
                "type": "info",
                "message": "New User Registration: john_doe",
                "timestamp": "2024-03-10T09:30:00Z",
                "link": "/users/123"
            },
             {
                "id": 3,
                "type": "success",
                "message": "Production Plan P-2024-001 Completed",
                "timestamp": "2024-03-09T16:00:00Z",
                "link": "/plans/1"
            }
        ],
        "systemPerformance": [
            { "month": "Jan", "revenue": 400000, "expenses": 240000 },
            { "month": "Feb", "revenue": 300000, "expenses": 139800 },
            { "month": "Mar", "revenue": 200000, "expenses": 980000 },
            { "month": "Apr", "revenue": 278000, "expenses": 390800 },
            { "month": "May", "revenue": 189000, "expenses": 480000 },
            { "month": "Jun", "revenue": 239000, "expenses": 380000 }
        ]
    }
}
```

## ❌ Error Response (Example)
```json
{
    "success": false,
    "message": "Internal Server Error",
    "error": {
        "code": "INTERNAL_ERROR",
        "details": "Database connection failed"
    }
}
```
