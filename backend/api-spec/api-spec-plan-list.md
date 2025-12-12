# Plan List API Specification

เอกสารอธิบาย API สำหรับการจัดการรายการแผน (Plan List)
**หมายเหตุ**: ข้อมูล Response ในส่วน `data` ของ `findAll` และ `findOne` จะเป็นโครงสร้างตาม Entity `PlanList`

---

# 1. Get All Plan Lists

ดึงข้อมูลรายการ Plan List ทั้งหมด รองรับการแบ่งหน้า (Pagination) และการเรียงลำดับ

## 📌 Endpoint
`GET /plan-lists`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| sort_field | string | ฟิลด์ที่ใช้จัดเรียงข้อมูล |
| sort_order | string | การจัดเรียงข้อมูล (ASC หรือ DESC) (default = ASC) |

## 🧪 Example Request
`GET http://localhost:3000/plan-lists?page=1&limit=10&sort_order=DESC`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 1,
            "plan": {
                "id": 1,
                "product_id": 29,
                "input_quantity": 112,
                "plan_name": "A new",
                "plan_description": "test",
                "start_date": null,
                "end_date": null,
                "created_at": "2024-01-01T00:00:00.000Z",
                "updated_at": "2024-01-01T00:00:00.000ZZ",
                "deleted_at": null
            },
            "plan_id": 1,
            "priority": "HIGH",
            "status": "PENDING",
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z",
            "deleted_at": null,
        }
    ],
    "meta": {
        "totalItems": 1,
        "itemCount": 1,
        "itemsPerPage": 10,
        "totalPages": 1,
        "currentPage": 1
    }
}
```

---

# 2. Get Plan List by ID

ดึงข้อมูล Plan List ตาม ID

## 📌 Endpoint
`GET /plan-lists/:id`

## 🧪 Example Request
`GET http://localhost:3000/plan-lists/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ", 
    "data": {
    "id": 1,
    "plan_id": 1,
    "priority": "HIGH",
    "status": "PENDING",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": null,
    "plan": { "product_id": 29,
            "product_name": "smart_tv",
            "product_type_id": null,
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
            }
    }
}
```

---

# 3. Create Plan List

สร้าง Plan List ใหม่

## 📌 Endpoint
`POST /plan-lists`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| plan_id | number | Yes | ID ของ Product Plan |
| priority | enum | No | ความสำคัญ (LOW, MEDIUM, HIGH, URGENT) |
| status | enum | No | สถานะ (PENDING, IN_PROGRESS, COMPLETED, CANCELLED) |

## 🧪 Example Body
```json
{
    "success": true,
    "message": "สำเร็จ", 
    "data": {
    "plan_id": 1,
    "priority": "HIGH",
    "status": "PENDING"
    }
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "id": 1,
        "plan_id": 1,
        "priority": "HIGH",
        "status": "PENDING",
        "created_at": "...",
        "updated_at": "...",
        "deleted_at": null
    }
}
```

---

# 4. Update Plan List

แก้ไขข้อมูล Plan List

## 📌 Endpoint
`PUT /plan-lists/:id`

## 📦 Request Body
ส่งเฉพาะฟิลด์ที่ต้องการแก้ไข (Partial)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| plan_id | number | No | ID ของ Product Plan |
| priority | enum | No | ความสำคัญ |
| status | enum | No | สถานะ |

## 🧪 Example Body
```json
{
    "status": "IN_PROGRESS"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขสำเร็จ",
    "data": {}
}
```

---

# 5. Delete Plan List (Soft Delete)

ลบ Plan List (Soft Delete)

## 📌 Endpoint
`DELETE /plan-lists/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/plan-lists/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบสำเร็จ",
    "data": {}
}
```

---

# 6. Restore Plan List

กู้คืน Plan List ที่ถูกลบ

## 📌 Endpoint
`PUT /plan-lists/:id/restore`

## 🧪 Example Request
`PUT http://localhost:3000/plan-lists/1/restore`

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนสำเร็จ",
    "data": {}
}
```
