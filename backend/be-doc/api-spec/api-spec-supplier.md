# Supplier API Specification

เอกสารอธิบาย API สำหรับจัดการข้อมูลผู้จัดจำหน่าย (Supplier)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get All Suppliers

ดึงข้อมูลผู้จัดจำหน่ายทั้งหมด รองรับการแบ่งหน้า (Pagination) และการกรองข้อมูลเบื้องต้น

## 📌 Endpoint
`GET /suppliers`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| is_active | boolean | สถานะการใช้งาน (true/false) |
| sort_order | string | การจัดเรียงข้อมูลตามชื่อผู้จัดจำหน่าย (ASC หรือ DESC) (default = ASC) |

## 🧪 Example Request
`GET http://localhost:3000/suppliers?page=1&limit=10&is_active=true`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "supplier_id": 1,
            "supplier_name": "ABC Supply Co.",
            "phone": "02-123-4567",
            "email": "contact@abc.com",
            "address": "Bangkok",
            "is_active": true,
            "update_date": "2024-01-01T00:00:00.000Z",
            "deleted_at": null
        },
        {
            "supplier_id": 2,
            "supplier_name": "XYZ Global",
            "phone": null,
            "email": "sales@xyz.com",
            "address": "Rayong",
            "is_active": true,
            "update_date": "2024-01-02T00:00:00.000Z",
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

# 2. Get Supplier by ID

ดึงข้อมูลผู้จัดจำหน่ายตาม ID

## 📌 Endpoint
`GET /suppliers/:id`

## 🧪 Example Request
`GET http://localhost:3000/suppliers/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "supplier_id": 1,
        "supplier_name": "ABC Supply Co.",
        "phone": "02-123-4567",
        "email": "contact@abc.com",
        "address": "Bangkok",
        "is_active": true,
        "update_date": "2024-01-01T00:00:00.000Z",
        "deleted_at": null
    }
}
```

## ✅ Success Response (Not Found)
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": null
}
```

---

# 3. Create Supplier

สร้างผู้จัดจำหน่ายใหม่

## 📌 Endpoint
`POST /suppliers`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| supplier_name | string | No | ชื่อผู้จัดจำหน่าย |
| phone | string | No | เบอร์โทรศัพท์ |
| email | string | No | อีเมล |
| address | string | No | ที่อยู่ |
| is_active | boolean | No | สถานะการใช้งาน (default = true) |

## 🧪 Example Body
```json
{
    "supplier_name": "Best Supplies",
    "phone": "081-111-2222",
    "email": "info@bestsupplies.com",
    "address": "123 Main St.",
    "is_active": true
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "supplier_name": "Best Supplies",
        "phone": "081-111-2222",
        "email": "info@bestsupplies.com",
        "address": "123 Main St.",
        "is_active": true,
        "supplier_id": 3,
        "update_date": "2025-12-08T08:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 4. Update Supplier

แก้ไขข้อมูลผู้จัดจำหน่าย

## 📌 Endpoint
`PUT /suppliers/:id`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| supplier_name | string | No | ชื่อผู้จัดจำหน่าย |
| phone | string | No | เบอร์โทรศัพท์ |
| email | string | No | อีเมล |
| address | string | No | ที่อยู่ |
| is_active | boolean | No | สถานะการใช้งาน |

## 🧪 Example Body
```json
{
    "phone": "099-888-7777"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขสำเร็จ",
    "data": {
        "supplier_id": 3,
        "supplier_name": "Best Supplies",
        "phone": "099-888-7777",
        "email": "info@bestsupplies.com",
        "address": "123 Main St.",
        "is_active": true,
        "update_date": "2025-12-08T08:05:00.000Z",
        "deleted_at": null
    }
}
```

---

# 5. Delete Supplier (Soft Delete)

ลบผู้จัดจำหน่าย (Soft Delete)

## 📌 Endpoint
`DELETE /suppliers/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/suppliers/3`

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบสำเร็จ",
    "data": {}
}
```

---

# 6. Restore Supplier

กู้คืนผู้จัดจำหน่ายที่ถูกลบ

## 📌 Endpoint
`PUT /suppliers/:id/restore`

## 🧪 Example Request
`PUT http://localhost:3000/suppliers/3/restore`

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
            "email must be an email"
        ],
        "details": [
            "email must be an email"
        ]
    }
}
```
