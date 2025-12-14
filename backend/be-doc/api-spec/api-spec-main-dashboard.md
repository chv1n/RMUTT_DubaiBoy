# Main Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard หลัก (Main Dashboard) เพื่อดูภาพรวมของระบบทั้ง User, Materials, Production Plan และ Inventory

---

# 1. Overview Stats

ดึงข้อมูลสถิติภาพรวมของระบบทั้งหมด รวมถึงการแจ้งเตือนและการวัดผลการดำเนินงาน

## 📌 Endpoint
`GET /dashboard/overview`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| range | string | No | ช่วงเวลา (Default: 'month') |

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "users": {
            "total": 150,
            "active": 140,
            "inactive": 10,
            "change": 5,
            "trend": "up"
        },
        "materials": {
            "total": 1200,
            "lowStock": 5,
            "outOfStock": 2,
            "active": 1150,
            "change": 12,
            "changeTrend": "up"
        },
        "plans": {
            "active": 8,
            "completed": 45,
            "totalTarget": 50000,
            "onTimeRate": 92.5,
            "trend": "up"
        },
        "inventory": {
            "totalValue": 1500000.00,
            "currency": "THB",
            "inboundToday": 2500,
            "outboundToday": 1200,
            "movements": 3700
        },
        "alerts": [
            {
                "id": 1,
                "type": "warning",
                "message": "Low stock items: 5",
                "timestamp": "2023-11-20T09:30:00.000Z",
                "link": "/materials/dashboard"
            },
            {
                "id": 2,
                "type": "critical",
                "message": "On-time rate dropped to 75%",
                "timestamp": "2023-11-20T10:15:00.000Z",
                "link": "/product-plans"
            }
        ],
        "systemPerformance": [
            {
                "month": "Jun",
                "revenue": 500000,
                "expenses": 300000
            },
            {
                "month": "Jul",
                "revenue": 550000,
                "expenses": 320000
            }
        ]
    }
}
```
