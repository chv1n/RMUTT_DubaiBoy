# BOM API Specification

เอกสารอธิบาย API สำหรับการจัดการ Bill of Materials (BOM)
**หมายเหตุ**: ข้อมูล Response ในส่วน `data` ของ `findAll` และ `findOne` จะเป็นโครงสร้างตาม Entity `Bom`

---

# 1. Get All BOMs

ดึงข้อมูลรายการ BOM ทั้งหมด รองรับการแบ่งหน้า (Pagination) และการกรองข้อมูล

## 📌 Endpoint
`GET /boms`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| sort_field | string | ฟิลด์ที่ใช้จัดเรียงข้อมูล |
| sort_order | string | การจัดเรียงข้อมูล (ASC หรือ DESC) (default = ASC) |
| active | boolean | สถานะการใช้งาน (true/false) - *ใช้แทน is_active* |
| product_id | number | กรองตาม ID สินค้า |
| material_id | number | กรองตาม ID วัตถุดิบ |
| unit_id | number | กรองตาม ID หน่วยนับ |

## 🧪 Example Request
`GET http://localhost:3000/boms?page=1&limit=10&active=true&sort_order=DESC`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 1,
            "product": {
                "product_id": 1,
                "product_name": "Product A",
                "product_type_id": 1,
                "is_active": true,
                "created_at": "2024-01-01T00:00:00.000Z",
                "updated_at": "2024-01-01T00:00:00.000Z",
            },
            "material": {
                "material_id": 2,
                "material_name": "Material B",
                "material_group_id": 1,
                "order_leadtime": 7,
                "container_type_id": 1,
                "quantity_per_container": 50,
                "unit_id": 1,
                "container_min_stock": 100,
                "container_max_stock": 300,
                "lifetime": 24,
                "lifetime_unit": "month",
                "is_active": true,
                "update_date": "2024-01-01T00:00:00.000Z",
                "cost_per_unit": 12.5,
                "expiration_date": "2024-01-01T00:00:00.000Z",
                "supplier_id": 1,
                "deleted_at": null
            },
            "unit": {
                "unit_id": 1,
                "name": "KG"
                "create_at": "2024-01-01T00:00:00.000Z",
                "is_active": true,
                "deleted_at": null
            },
            "usage_per_piece": 5,
            "version": 1,
            "active": 1,
            "scrap_factor": 0.05,
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

# 2. Get BOM by ID

ดึงข้อมูล BOM ตาม ID

## 📌 Endpoint
`GET /boms/:id`

## 🧪 Example Request
`GET http://localhost:3000/boms/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data" : {
    "id": 1,
    "product": {
                "product_id": 1,
                "product_name": "Product A",
                "product_type_id": 1,
                "is_active": true,
                "created_at": "2024-01-01T00:00:00.000Z",
                "updated_at": "2024-01-01T00:00:00.000Z",
                },
   "material": {
                "material_id": 2,
                "material_name": "Material B",
                "material_group_id": 1,
                "order_leadtime": 7,
                "container_type_id": 1,
                "quantity_per_container": 50,
                "unit_id": 1,
                "container_min_stock": 100,
                "container_max_stock": 300,
                "lifetime": 24,
                "lifetime_unit": "month",
                "is_active": true,
                "update_date": "2024-01-01T00:00:00.000Z",
                "cost_per_unit": 12.5,
                "expiration_date": "2024-01-01T00:00:00.000Z",
                "supplier_id": 1,
                "deleted_at": null
                },
    "unit": {
            "unit_id": 1,
            "name": "KG",
            "create_at": "2024-01-01T00:00:00.000Z",
            "is_active": true,
            "deleted_at": null
            },
    "usage_per_piece": 5,
    "version": 1,
    "active": 1,
    "scrap_factor": 0.05,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": null,
   
    

    }
}
```

---

# 3. Create BOM

สร้าง BOM ใหม่

## 📌 Endpoint
`POST /boms`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| product_id | number | Yes | ID สินค้า |
| material_id | number | Yes | ID วัตถุดิบ |
| usage_per_piece | number | Yes | ปริมาณการใช้ต่อชิ้น |
| unit_id | number | Yes | ID หน่วยนับ |
| version | number | Yes | เวอร์ชั่น |
| active | number | Yes | สถานะ (1 = Active, 0 = Inactive) |
| scrap_factor | number | Yes | เปอร์เซ็นต์การสูญเสีย |

## 🧪 Example Body
```json
{
    "product_id": 1,
    "material_id": 2,
    "usage_per_piece": 10,
    "unit_id": 1,
    "version": 1,
    "active": 1,
    "scrap_factor": 0.1
}
```

## ✅ Success Response
```json
{
    "message": "เพิ่มสำเร็จ",
    "data": {
        "id": 2,
        "product_id": 1,
        "material_id": 2,
        "usage_per_piece": 10,
        "unit_id": 1,
        "version": 1,
        "active": 1,
        "scrap_factor": 0.1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 4. Update BOM

แก้ไขข้อมูล BOM

## 📌 Endpoint
`PUT /boms/:id`

## 📦 Request Body
ส่งเฉพาะฟิลด์ที่ต้องการแก้ไข (Partial)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| product_id | number | No | ID สินค้า |
| material_id | number | No | ID วัตถุดิบ |
| usage_per_piece | number | No | ปริมาณการใช้ต่อชิ้น |
| unit_id | number | No | ID หน่วยนับ |
| version | number | No | เวอร์ชั่น |
| active | number | No | สถานะ (1/0) |
| scrap_factor | number | No | เปอร์เซ็นต์การสูญเสีย |

## 🧪 Example Body
```json
{
    "usage_per_piece": 12,
    "active": 0
}
```

## ✅ Success Response
```json
{
    "message": "แก้ไขสำเร็จ"
}
```

---

# 5. Delete BOM (Soft Delete)

ลบ BOM (Soft Delete)

## 📌 Endpoint
`DELETE /boms/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/boms/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขสำเร็จ",
    "data": {}
}
```

---

# 6. Restore BOM

กู้คืน BOM ที่ถูกลบ

## 📌 Endpoint
`PUT /boms/:id/restore`

## 🧪 Example Request
`PUT http://localhost:3000/boms/1/restore`

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนสำเร็จ",
    "data": {}
}
```
