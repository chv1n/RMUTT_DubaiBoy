# Container Type API Specification

เอกสารอธิบาย API สำหรับจัดการข้อมูลประเภทบรรจุภัณฑ์ (Container Type)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get All Container Types

ดึงข้อมูลรายการประเภทบรรจุภัณฑ์ทั้งหมด รองรับการแบ่งหน้า (Pagination) และการกรองข้อมูลเบื้องต้น

## 📌 Endpoint
`GET /container-types`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| is_active | boolean | สถานะการใช้งาน (true/false) |
| sort_order | string | การจัดเรียงข้อมูลตามชื่อประเภท (ASC หรือ DESC) (default = ASC) |

## 🧪 Example Request
`GET http://localhost:3000/container-types?page=1&limit=10&is_active=true`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "type_id": 1,
            "type_name": "Box",
            "is_active": true,
            "create_at": "2024-01-01T00:00:00.000Z",
            "deleted_at": null
        },
        {
            "type_id": 2,
            "type_name": "Pallet",
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

# 2. Get Container Type by ID

ดึงข้อมูลประเภทบรรจุภัณฑ์ตาม ID

## 📌 Endpoint
`GET /container-types/:id`

## 🧪 Example Request
`GET http://localhost:3000/container-types/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "type_id": 1,
        "type_name": "Box",
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

# 3. Create Container Type

สร้างประเภทบรรจุภัณฑ์ใหม่

## 📌 Endpoint
`POST /container-types`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| type_name | string | Yes | ชื่อประเภทบรรจุภัณฑ์ |
| is_active | boolean | No | สถานะการใช้งาน (default = true) |

## 🧪 Example Body
```json
{
    "type_name": "Crate",
    "is_active": true
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มประเภทบรรจุภัณฑ์สำเร็จ",
    "data": {
        "type_name": "Crate",
        "is_active": true,
        "type_id": 3,
        "create_at": "2025-12-08T08:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 4. Update Container Type

แก้ไขข้อมูลประเภทบรรจุภัณฑ์

## 📌 Endpoint
`PUT /container-types/:id`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| type_name | string | No | ชื่อประเภทบรรจุภัณฑ์ |
| is_active | boolean | No | สถานะการใช้งาน |

## 🧪 Example Body
```json
{
    "type_name": "Large Crate"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขประเภทบรรจุภัณฑ์สำเร็จ",
    "data": {
        "type_id": 3,
        "type_name": "Large Crate",
        "is_active": true,
        "create_at": "2025-12-08T08:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 5. Delete Container Type (Soft Delete)

ลบประเภทบรรจุภัณฑ์ (Soft Delete)

## 📌 Endpoint
`DELETE /container-types/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/container-types/3`

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบประเภทบรรจุภัณฑ์สำเร็จ",
    "data": {}
}
```

---

# 6. Restore Container Type

กู้คืนประเภทบรรจุภัณฑ์ที่ถูกลบ

## 📌 Endpoint
`PUT /container-types/:id/restore`

## 🧪 Example Request
`PUT http://localhost:3000/container-types/3/restore`

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนประเภทบรรจุภัณฑ์สำเร็จ",
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
            "type_name must be a string"
        ],
        "details": [
            "type_name must be a string"
        ]
    }
}
```
