# Product API Specification

เอกสารอธิบาย API สำหรับการจัดการข้อมูลสินค้า (Product)

---

# 1. Create Product

สร้างข้อมูลสินค้าใหม่

## 📌 Endpoint
`POST /products`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| product_name | string | Yes | ชื่อสินค้า (ต้องไม่ซ้ำ) |
| product_type_id | number | Yes | ID ของประเภทสินค้า |
| product_plan_id | number | No | ID ของแผนการผลิต (ถ้ามี) |
| is_active | boolean | No | สถานะการใช้งาน (Default: true) |

## 🧪 Example Body
```json
{
    "product_name": "New Product A",
    "product_type_id": 1,
    "is_active": true
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "product_name": "New Product A",
        "product_type_id": 1,
        "is_active": true,
        "product_id": 15,
        "created_at": "2023-10-27T09:00:00.000Z",
        "updated_at": "2023-10-27T09:00:00.000Z",
        "deleted_at": null,
        "id": 15
    }
}
```

---

# 2. Find All Products

ค้นหาและดึงข้อมูลสินค้าทั้งหมด พร้อม Pagination และ Filtering

## 📌 Endpoint
`GET /products`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| page | number | No | หน้าที่ต้องการ (Default: 1) |
| limit | number | No | จำนวนรายการต่อหน้า (Default: 20) |
| search | string | No | ค้นหาจากชื่อสินค้า |
| product_type_id | number | No | กรองตาม ID ประเภทสินค้า |
| product_type_name | string | No | กรองตามชื่อประเภทสินค้า |
| is_active | boolean | No | กรองสถานะ Active |
| sort_by | string | No | เรียงตามฟิลด์ (product_id, product_name, updated_at) |
| sort_order | string | No | ลำดับการเรียง (ASC, DESC) |

## ✅ Success Response
```json
{
    "data": [
        {
            "product_id": 1,
            "product_name": "Product A",
            "product_type_id": 1,
            "is_active": true,
            "created_at": "2023-01-01T00:00:00.000Z",
            "updated_at": "2023-10-27T10:00:00.000Z",
            "product_type": {
                "product_type_id": 3,
                "type_name": "Finished Goods",
                "is_active": true,
                "create_at": "2023-10-27T09:00:00.000Z",
                "updated_at": "2023-10-27T09:00:00.000Z"
            },
        }
    ],
    "meta": {
        "totalItems": 100,
        "itemCount": 20,
        "itemsPerPage": 20,
        "totalPages": 5,
        "currentPage": 1
    }
}
```

---

# 3. Find One Product

ดึงข้อมูลสินค้าตาม ID

## 📌 Endpoint
`GET /products/:id`

## 📦 Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| id | number | Yes | ID ของสินค้า |

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data" : {
    "product_id": 1,
    "product_name": "Product A",
    "product_type_id": 1,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-10-27T10:00:00.000Z",
    "product_type": {
                "product_type_id": 3,
                "type_name": "Finished Goods",
                "is_active": true,
                "create_at": "2023-10-27T09:00:00.000Z",
                "updated_at": "2023-10-27T09:00:00.000Z"
            },
    "boms": []
    }
}
```

---

# 4. Update Product

แก้ไขข้อมูลสินค้า

## 📌 Endpoint
`PUT /products/:id`

## 📦 Request Body (Partial Update)
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| product_name | string | No | ชื่อสินค้า |
| product_type_id | number | No | ID ของประเภทสินค้า |
| is_active | boolean | No | สถานะการใช้งาน |

## ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขสำเร็จ",
    "data" : {}
}
```
*(หรือ Object ที่ Update แล้ว ขึ้นอยู่กับ Implementation)*

---

# 5. Delete Product (Soft Delete)

ลบข้อมูลสินค้า (แบบ Soft Delete)

## 📌 Endpoint
`DELETE /products/:id`

## 📦 Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| id | number | Yes | ID ของสินค้า |

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบสำเร็จ"
    "data" : {}
}
```

---

# 6. Restore Product

กู้คืนข้อมูลสินค้าที่ถูกลบ

## 📌 Endpoint
`PUT /products/:id/restore`

## 📦 Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| id | number | Yes | ID ของสินค้า |

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนสำเร็จ"
    "data" : {}
}
```
