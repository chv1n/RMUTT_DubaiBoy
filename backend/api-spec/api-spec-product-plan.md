# Product Plan API Specification

เอกสารอธิบาย API สำหรับการจัดการแผนการผลิต (Product Plan)
**หมายเหตุ**: ข้อมูล Response ในส่วน `data` ของ `findAll` และ `findOne` จะเป็นโครงสร้างตาม Entity `ProductPlan`

---

# 1. Get All Product Plans

ดึงข้อมูลรายการแผนการผลิตทั้งหมด รองรับการแบ่งหน้า (Pagination) และการเรียงลำดับ

## 📌 Endpoint
`GET /product-plans`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| sort_field | string | ฟิลด์ที่ใช้จัดเรียงข้อมูล |
| sort_order | string | การจัดเรียงข้อมูล (ASC หรือ DESC) (default = ASC) |

## 🧪 Example Request
`GET http://localhost:3000/product-plans?page=1&limit=10&sort_order=DESC`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 1,
            "product_id": 1,
            "input_quantity": 1000,
            "plan_name": "Plan A",
            "plan_description": "Description A",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z",
            "deleted_at": null,
            "product": {
                "product_id": 29,
                "product_name": "smart_tv",
                "product_type_id": null,
                "is_active": true,
                "created_at": "2024-01-01T00:00:00.000Z",
                "updated_at": "2024-01-01T00:00:00.000Z"
            }
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

# 2. Get Product Plan by ID

ดึงข้อมูลแผนการผลิตตาม ID

## 📌 Endpoint
`GET /product-plans/:id`

## 🧪 Example Request
`GET http://localhost:3000/product-plans/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data" : {
    "id": 1,
    "product_id": 1,
    "input_quantity": 1000,
    "plan_name": "Plan A",
    "plan_description": "Description A",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": null,
    "product": { "product_id": 29,
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

# 3. Create Product Plan

สร้างแผนการผลิตใหม่

## 📌 Endpoint
`POST /product-plans`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| product_id | number | Yes | ID สินค้า |
| plan_name | string | No | ชื่อแผน |
| plan_description | string | No | รายละเอียดแผน |
| start_date | string | No | วันที่เริ่ม (ISO 8601 Date String) |
| end_date | string | No | วันที่สิ้นสุด (ISO 8601 Date String) |
| input_quantity | number | No | จำนวนที่ผลิต |

## 🧪 Example Body
```json
{
    "product_id": 1,
    "plan_name": "Q1 Production",
    "input_quantity": 5000,
    "start_date": "2024-01-01",
    "end_date": "2024-03-31"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "id": 1,
        "product_id": 1,
        "plan_name": "Q1 Production",
        "input_quantity": 5000,
        "start_date": "2024-01-01",
        "end_date": "2024-03-31",
        "created_at": "...",
        "updated_at": "...",
        "deleted_at": null
    }
}
```

---

# 4. Update Product Plan

แก้ไขข้อมูลแผนการผลิต

## 📌 Endpoint
`PUT /product-plans/:id`

## 📦 Request Body
ส่งเฉพาะฟิลด์ที่ต้องการแก้ไข (Partial)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| product_id | number | No | ID สินค้า |
| plan_name | string | No | ชื่อแผน |
| plan_description | string | No | รายละเอียดแผน |
| start_date | string | No | วันที่เริ่ม |
| end_date | string | No | วันที่สิ้นสุด |
| input_quantity | number | No | จำนวนที่ผลิต |

## 🧪 Example Body
```json
{
    "input_quantity": 6000
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

# 5. Delete Product Plan (Soft Delete)

ลบแผนการผลิต (Soft Delete)

## 📌 Endpoint
`DELETE /product-plans/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/product-plans/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบไขสำเร็จ",
    "data": {}
}
```

---

# 6. Restore Product Plan

กู้คืนแผนการผลิตที่ถูกลบ

## 📌 Endpoint
`PUT /product-plans/:id/restore`

## 🧪 Example Request
`PUT http://localhost:3000/product-plans/1/restore`

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนสำเร็จ",
    "data": {}
}
```
