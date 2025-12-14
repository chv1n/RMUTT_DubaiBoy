# Warehouse Master API Specification

เอกสารอธิบาย API สำหรับจัดการข้อมูลคลังสินค้า (Warehouse Master)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get All Warehouses

ดึงข้อมูลคลังสินค้าทั้งหมด รองรับการแบ่งหน้า (Pagination) และการกรองข้อมูลเบื้องต้น

## 📌 Endpoint
`GET /v1/warehouse`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| is_active | boolean | สถานะการใช้งาน (true/false) |
| sort_order | string | การจัดเรียงข้อมูล (ASC หรือ DESC) (default = DESC) |
| sort_by | string | ชื่อฟิลด์ที่ต้องการจัดเรียง (default = updated_at) |
| search | string | คำค้นหา (ค้นหาจาก warehouse_name, warehouse_address, warehouse_email) |
| warehouse_id | number | กรองตาม ID คลังสินค้า |
| warehouse_name | string | กรองตามชื่อคลังสินค้า |
| warehouse_address | string | กรองตามที่อยู่คลังสินค้า |
| warehouse_phone | string | กรองตามเบอร์โทรศัพท์ |
| warehouse_email | string | กรองตามอีเมล |

## 🧪 Example Request
`GET http://localhost:3000/v1/warehouse?page=1&limit=10&is_active=true`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 1,
            "warehouse_name": "Main Warehouse",
            "warehouse_code": "WH001",
            "warehouse_phone": "02-999-9999",
            "warehouse_address": "Bangkok",
            "warehouse_email": "wh001@example.com",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z",
            "deleted_at": null
        },
        {
            "id": 2,
            "warehouse_name": "Rangsit Warehouse",
            "warehouse_code": "WH002",
            "warehouse_phone": "02-888-8888",
            "warehouse_address": "Pathum Thani",
            "warehouse_email": null,
            "is_active": true,
            "created_at": "2024-01-02T00:00:00.000Z",
            "updated_at": "2024-01-02T00:00:00.000Z",
            "deleted_at": null
        }
    ],
    "meta": {
        "totalItems": 2,
        "itemCount": 2,
        "itemsPerPage": 10,
        "totalPages": 1,
        "currentPage": 1
    }
}
```

---

# 2. Get Warehouse by ID

ดึงข้อมูลคลังสินค้าตาม ID

## 📌 Endpoint
`GET /v1/warehouse/:id`

## 🧪 Example Request
`GET http://localhost:3000/v1/warehouse/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "id": 1,
        "warehouse_name": "Main Warehouse",
        "warehouse_code": "WH001",
        "warehouse_phone": "02-999-9999",
        "warehouse_address": "Bangkok",
        "warehouse_email": "wh001@example.com",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "deleted_at": null
    }
}
```

## ✅ Success Response (Not Found)
```json
{
    "success": false,
    "error": {
        "code": "HTTP_404",
        "message": "Warehouse Master with ID 1 not found"
    }
}
```

---

# 3. Create Warehouse

สร้างคลังสินค้าใหม่

## 📌 Endpoint
`POST /v1/warehouse`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| warehouse_name | string | Yes | ชื่อคลังสินค้า |
| warehouse_code | string | Yes | รหัสคลังสินค้า |
| warehouse_phone | string | No | เบอร์โทรศัพท์ |
| warehouse_address | string | No | ที่อยู่ |
| warehouse_email | string | No | อีเมล |
| is_active | boolean | No | สถานะการใช้งาน (default = true) |

## 🧪 Example Body
```json
{
    "warehouse_name": "New Warehouse",
    "warehouse_code": "WH003",
    "warehouse_phone": "081-123-4567",
    "warehouse_email": "new@example.com",
    "warehouse_address": "Ayutthaya",
    "is_active": true
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "warehouse_name": "New Warehouse",
        "warehouse_code": "WH003",
        "warehouse_phone": "081-123-4567",
        "warehouse_email": "new@example.com",
        "warehouse_address": "Ayutthaya",
        "is_active": true,
        "id": 3,
        "created_at": "2025-12-08T08:00:00.000Z",
        "updated_at": "2025-12-08T08:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 4. Update Warehouse

แก้ไขข้อมูลคลังสินค้า

## 📌 Endpoint
`PUT /v1/warehouse/:id`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| warehouse_name | string | No | ชื่อคลังสินค้า |
| warehouse_code | string | No | รหัสคลังสินค้า |
| warehouse_phone | string | No | เบอร์โทรศัพท์ |
| warehouse_address | string | No | ที่อยู่ |
| warehouse_email | string | No | อีเมล |
| is_active | boolean | No | สถานะการใช้งาน |

## 🧪 Example Body
```json
{
    "warehouse_phone": "099-888-7777"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขสำเร็จ",
    "data": {
        "id": 3,
        "warehouse_name": "New Warehouse",
        "warehouse_code": "WH003",
        "warehouse_phone": "099-888-7777",
        "warehouse_address": "Ayutthaya",
        "is_active": true,
        "created_at": "2025-12-08T08:00:00.000Z",
        "updated_at": "2025-12-08T08:05:00.000Z",
        "deleted_at": null
    }
}
```

---

# 5. Delete Warehouse (Soft Delete)

ลบคลังสินค้า (Soft Delete)

## 📌 Endpoint
`DELETE /v1/warehouse/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/v1/warehouse/3`

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบสำเร็จ",
    "data": {}
}
```

---

# 6. Restore Warehouse

กู้คืนคลังสินค้าที่ถูกลบ

## 📌 Endpoint
`PATCH /v1/warehouse/:id/restore`

## 🧪 Example Request
`PATCH http://localhost:3000/v1/warehouse/3/restore`

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนสำเร็จ",
    "data": {}
}
```

---

# Error Response (ตัวอย่าง)

```json
{
    "success": false,
    "error": {
        "code": "HTTP_400",
        "message": [
            "warehouse_name should not be empty"
        ],
        "details": [
            "warehouse_name should not be empty"
        ]
    }
}
```
