# User Dashboard API Specification

เอกสารอธิบาย API สำหรับหน้า User Dashboard (แดชบอร์ดผู้ใช้งาน)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get User Dashboard Stats

ดึงข้อมูลสถิติและตัวชี้วัด (KPIs) สำหรับหน้าแดชบอร์ดผู้ใช้งาน เช่น จำนวนผู้ใช้ทั้งหมด, ผู้ใช้ใหม่, ยอด active/inactive และแนวโน้มการเติบโต

## 📌 Endpoint
`GET /users/dashboard/stats`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| period | string | ช่วงเวลาสำหรับกราฟแนวโน้ม (e.g., '6months', 'year') (Optional, default='6months') |

## 🧪 Example Request
`GET http://localhost:3000/users/dashboard/stats?period=6months`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "totalUsers": 1250,
        "activeUsers": 1100,
        "inactiveUsers": 150,
        "newUsersThisMonth": 45,
        "roleDistribution": [
            { "name": "USER", "value": 1000, "color": "#0088FE" },
            { "name": "ADMIN", "value": 50, "color": "#00C49F" },
            { "name": "SUPER_ADMIN", "value": 5, "color": "#FFBB28" }
        ],
        "userGrowth": [
            { "month": "Jan", "count": 120 },
            { "month": "Feb", "count": 135 },
            { "month": "Mar", "count": 150 },
            { "month": "Apr", "count": 180 },
            { "month": "May", "count": 220 },
            { "month": "Jun", "count": 250 }
        ],
        "recentActivity": [
            { 
                "id": 101, 
                "user": "Alice Smith", 
                "action": "LOGIN", 
                "timestamp": "2024-03-10T10:00:00Z",
                "details": "Logged in from IP 192.168.1.1"
            },
            { 
                "id": 102, 
                "user": "Bob Jones", 
                "action": "UPDATE_PROFILE", 
                "timestamp": "2024-03-10T09:45:00Z", 
                "details": "Updated email address"
            }
        ]
    }
}
```

---

# 2. Get User Activity Logs

ดึงข้อมูลประวัติการใช้งานของผู้ใช้งาน (Log) เพื่อแสดงใน Activity Feed

## 📌 Endpoint
`GET /users/dashboard/activity`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| limit | number | จำนวนรายการที่ต้องการดึง (default=10) |
| page | number | หน้าที่ต้องการดึง (default=1) |

## 🧪 Example Request
`GET http://localhost:3000/users/dashboard/activity?limit=5`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 55,
            "userId": 1,
            "username": "admin",
            "action": "CREATE_USER",
            "target": "user_john_doe",
            "timestamp": "2024-03-10T08:00:00Z"
        },
        {
            "id": 54,
            "userId": 2,
            "username": "manager",
            "action": "APPROVE_PLAN",
            "target": "PLAN-2024-01",
            "timestamp": "2024-03-10T07:55:00Z"
        }
    ],
    "meta": {
        "totalItems": 1500,
        "itemsPerPage": 5,
        "totalPages": 300,
        "currentPage": 1
    }
}
```
