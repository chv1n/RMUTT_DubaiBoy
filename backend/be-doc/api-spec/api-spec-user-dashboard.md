<<<<<<< HEAD
# User Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard ของผู้ใช้งาน (User) เพื่อดูสถิติจำนวนผู้ใช้และกิจกรรมล่าสุด

---

# 1. User Stats

ดึงข้อมูลสถิติจำนวนผู้ใช้งานรายเดือน, การเติบโต และการกระจายตัวของ Role

## 📌 Endpoint
`GET /users/dashboard/stats`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| period | string | No | ช่วงเวลาสำหรับกราฟการเติบโต: 'year', '6months' (Default: '6months') |

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "totalUsers": 150,
        "activeUsers": 140,
        "inactiveUsers": 10,
        "newUsersThisMonth": 5,
        "roleDistribution": [
            { "name": "ADMIN", "value": 10, "color": "#00C49F" },
            { "name": "USER", "value": 140, "color": "#0088FE" }
        ],
        "userGrowth": [
            { "month": "Jan", "count": 100 },
            { "month": "Feb", "count": 120 }
        ],
        "recentActivity": [
            { "id": 1, "user": "admin", "action": "LOGIN", "timestamp": "..." }
        ]
    }
}
```

---

# 2. User Activity Logs

ดึงข้อมูลประวัติการใช้งานระบบ (Audit Logs) แบบแบ่งหน้า

## 📌 Endpoint
`GET /users/dashboard/activity`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| page | number | No | หน้าที่ต้องการ (Default: 1) |
| limit | number | No | จำนวนรายการต่อหน้า (Default: 10) |

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 101,
            "userId": 1,
            "username": "admin",
            "action": "CREATE_USER",
            "target": "USER 15",
            "timestamp": "2023-11-01T10:00:00.000Z"
        }
    ],
    "meta": {
        "totalItems": 1000,
        "itemsPerPage": 10,
        "totalPages": 100,
        "currentPage": 1
    }
}
```
=======
# User Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard ของผู้ใช้งาน (User) เพื่อดูสถิติจำนวนผู้ใช้และกิจกรรมล่าสุด

---

# 1. User Stats

ดึงข้อมูลสถิติจำนวนผู้ใช้งานรายเดือน, การเติบโต และการกระจายตัวของ Role

## 📌 Endpoint
`GET /users/dashboard/stats`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| period | string | No | ช่วงเวลาสำหรับกราฟการเติบโต: 'year', '6months' (Default: '6months') |

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "totalUsers": 150,
        "activeUsers": 140,
        "inactiveUsers": 10,
        "newUsersThisMonth": 5,
        "roleDistribution": [
            { "name": "ADMIN", "value": 10, "color": "#00C49F" },
            { "name": "USER", "value": 140, "color": "#0088FE" }
        ],
        "userGrowth": [
            { "month": "Jan", "count": 100 },
            { "month": "Feb", "count": 120 }
        ],
        "recentActivity": [
            { "id": 1, "user": "admin", "action": "LOGIN", "timestamp": "..." }
        ]
    }
}
```

---

# 2. User Activity Logs

ดึงข้อมูลประวัติการใช้งานระบบ (Audit Logs) แบบแบ่งหน้า

## 📌 Endpoint
`GET /users/dashboard/activity`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| page | number | No | หน้าที่ต้องการ (Default: 1) |
| limit | number | No | จำนวนรายการต่อหน้า (Default: 10) |

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 101,
            "userId": 1,
            "username": "admin",
            "action": "CREATE_USER",
            "target": "USER 15",
            "timestamp": "2023-11-01T10:00:00.000Z"
        }
    ],
    "meta": {
        "totalItems": 1000,
        "itemsPerPage": 10,
        "totalPages": 100,
        "currentPage": 1
    }
}
```
>>>>>>> develop
