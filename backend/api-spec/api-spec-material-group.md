# Material Group API Specification

เอกสารอธิบาย API สำหรับจัดการข้อมูลกลุ่มวัสดุ (Material Group)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get All Material Groups

ดึงข้อมูลรายการกลุ่มวัสดุทั้งหมด รองรับการแบ่งหน้า (Pagination) และการกรองข้อมูลเบื้องต้น

## 📌 Endpoint
`GET /material-groups`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| is_active | boolean | สถานะการใช้งาน (true/false) |
| sort_order | string | การจัดเรียงข้อมูลตามชื่อกลุ่ม (ASC หรือ DESC) (default = ASC) |

## 🧪 Example Request
`GET http://localhost:3000/material-groups?page=1&limit=10&is_active=true`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "group_id": 1,
            "group_name": "Metal",
            "abbreviation": "MTL",
            "is_active": true,
            "create_at": "2024-01-01T00:00:00.000Z",
            "deleted_at": null
        },
        {
            "group_id": 2,
            "group_name": "Chemical",
            "abbreviation": "CHM",
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

# 2. Get Material Group by ID

ดึงข้อมูลกลุ่มวัสดุรายรายการตาม ID

## 📌 Endpoint
`GET /material-groups/:id`

## 🧪 Example Request
`GET http://localhost:3000/material-groups/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "group_id": 1,
        "group_name": "Metal",
        "abbreviation": "MTL",
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

# 3. Create Material Group

สร้างกลุ่มวัสดุใหม่

## 📌 Endpoint
`POST /material-groups`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| group_name | string | Yes | ชื่อกลุ่มวัสดุ |
| abbreviation | string | Yes | ตัวย่อของกลุ่ม |
| is_active | boolean | Yes | สถานะการใช้งาน (true/false) |

## 🧪 Example Body
```json
{
    "group_name": "Plastic",
    "abbreviation": "PL",
    "is_active": true
}
```

## ✅ Success Response

``` json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "group_name": "Plastic",
        "abbreviation": "PL",
        "is_active": true,
        "group_id": 3,
        "create_at": "2025-12-08T08:00:00.000Z",
        "deleted_at": null
    }
}

 ```

# Error Response (ตัวอย่าง)

``` json
{
    "success": false,
    "error": {
        "code": "HTTP_400",
        "message": [
            "abbreviation must be a string"
        ],
        "details": [
            "abbreviation must be a string"
        ]
    }
}

 ```

---

# 4. Update Material Group

แก้ไขข้อมูลกลุ่มวัสดุ

## 📌 Endpoint
`PUT /material-groups/:id`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| group_name | string | No | ชื่อกลุ่มวัสดุ |
| abbreviation | string | No | ตัวย่อของกลุ่ม |
| is_active | boolean | No | สถานะการใช้งาน |

## 🧪 Example Body
```json
{
    "group_name": "Hard Plastic"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขสำเร็จ",
    "data": {
        "group_id": 3,
        "group_name": "Hard Plastic",
        "abbreviation": "PL",
        "is_active": true,
        "create_at": "2025-12-08T08:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 5. Delete Material Group (Soft Delete)

ลบกลุ่มวัสดุ (Soft Delete - เปลี่ยนสถานะ deleted_at)

## 📌 Endpoint
`DELETE /material-groups/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/material-groups/3`

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบสำเร็จ",
    "data": {}
}
```

---

# 6. Restore Material Group

กู้คืนกลุ่มวัสดุที่ถูกลบไปแล้ว

## 📌 Endpoint
`PUT /material-groups/:id/restore`

## 🧪 Example Request
`PUT http://localhost:3000/material-groups/3/restore`

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนสำเร็จ",
    "data": {}
}
```

---

# 🚫 Default Error Response

เมื่อเกิดข้อผิดพลาดจากฝั่ง Server หรือ Validation

```json
{
    "success": false,
    "error": {
        "code": "HTTP_400",
        "message": [
            "property is_active should not exist",
            "group_name must be a string"
        ],
        "details": [
            "property is_active should not exist",
            "group_name must be a string"
        ]
    }
}
```
