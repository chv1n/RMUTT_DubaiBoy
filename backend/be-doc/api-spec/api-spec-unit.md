# Unit API Specification

เอกสารอธิบาย API สำหรับจัดการข้อมูลหน่วยนับ (Unit)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get All Units

ดึงข้อมูลรายการหน่วยนับทั้งหมด รองรับการแบ่งหน้า (Pagination) และการกรองข้อมูลเบื้องต้น

## 📌 Endpoint
`GET /units`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| is_active | boolean | สถานะการใช้งาน (true/false) |
| sort_order | string | การจัดเรียงข้อมูลตามชื่อหน่วยนับ (ASC หรือ DESC) (default = ASC) |

## 🧪 Example Request
`GET http://localhost:3000/units?page=1&limit=10&is_active=true`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "unit_id": 1,
            "unit_name": "Piece",
            "is_active": true,
            "create_at": "2024-01-01T00:00:00.000Z",
            "deleted_at": null
        },
        {
            "unit_id": 2,
            "unit_name": "Kilogram",
            "is_active": true,
            "create_at": "2024-01-02T00:00:00.000Z",
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

# 2. Get Unit by ID

ดึงข้อมูลหน่วยนับตาม ID

## 📌 Endpoint
`GET /units/:id`

## 🧪 Example Request
`GET http://localhost:3000/units/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "unit_id": 1,
        "unit_name": "Piece",
        "is_active": true,
        "create_at": "2024-01-01T00:00:00.000Z",
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

# 3. Create Unit

สร้างหน่วยนับใหม่

## 📌 Endpoint
`POST /units`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| unit_name | string | Yes | ชื่อหน่วยนับ |
| is_active | boolean | No | สถานะการใช้งาน (default = true) |

## 🧪 Example Body
```json
{
    "unit_name": "Liter",
    "is_active": true
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "unit_name": "Liter",
        "is_active": true,
        "unit_id": 3,
        "create_at": "2025-12-08T08:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 4. Update Unit

แก้ไขข้อมูลหน่วยนับ

## 📌 Endpoint
`PUT /units/:id`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| unit_name | string | No | ชื่อหน่วยนับ |
| is_active | boolean | No | สถานะการใช้งาน |

## 🧪 Example Body
```json
{
    "unit_name": "Milliliter"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขสำเร็จ",
    "data": {
        "unit_id": 3,
        "unit_name": "Milliliter",
        "is_active": true,
        "create_at": "2025-12-08T08:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 5. Delete Unit (Soft Delete)

ลบหน่วยนับ (Soft Delete)

## 📌 Endpoint
`DELETE /units/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/units/3`

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบหน่วยนับสำเร็จ",
    "data": {}
}
```

---

# 6. Restore Unit

กู้คืนหน่วยนับที่ถูกลบ

## 📌 Endpoint
`PUT /units/:id/restore`

## 🧪 Example Request
`PUT http://localhost:3000/units/3/restore`

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนหน่วยนับสำเร็จ",
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
            "unit_name must be a string"
        ],
        "details": [
            "unit_name must be a string"
        ]
    }
}
```
