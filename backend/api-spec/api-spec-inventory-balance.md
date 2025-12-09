# Inventory Balance API Specification

เอกสารอธิบาย API สำหรับการจัดการและตรวจสอบยอดคงคลัง (Inventory Balance Control)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Stock By Warehouse

ดูยอดคงคลังแยกตามคลังสินค้า

## 📌 Endpoint
`GET /v1/inventory/balance`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | No | กรองตามรหัสวัสดุ |
| warehouse_id | number | No | กรองตามรหัสคลังสินค้า |
| search | string | No | คำค้นหา (ชื่อวัสดุ หรือ ชื่อคลังสินค้า) |
| include_zero_stock | boolean | No | แสดงรายการที่ยอดเป็น 0 ด้วยหรือไม่ (default = false) |
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนข้อมูลต่อหน้า (default = 20) |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/balance?search=Steel`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "data": [
            {
                "material_id": 1,
                "material_name": "Steel Bar",
                "warehouse_id": 1,
                "warehouse_name": "Main Warehouse",
                "quantity": 150,
                "mfg_date": "2023-01-01T00:00:00.000Z",
                "exp_date": null,
                "order_number": "LOT-A1"
            }
        ],
        "meta": {
            "totalItems": 1,
            "itemCount": 1,
            "itemsPerPage": 20,
            "totalPages": 1,
            "currentPage": 1
        }
    }
}
```

---

# 2. Total Stock View

ดูยอดรวมสินค้าทั้งหมดจากทุกคลัง

## 📌 Endpoint
`GET /v1/inventory/balance/total`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | No | กรองตามรหัสวัสดุ |
| material_name | string | No | กรองตามชื่อวัสดุ |
| search | string | No | คำค้นหาชื่อวัสดุ |
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนข้อมูลต่อหน้า (default = 20) |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/balance/total?page=1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "data": [
            {
                "material_id": 1,
                "material_name": "Steel Bar",
                "total_quantity": 250,
                "warehouse_breakdown": [
                    {
                        "warehouse_id": 1,
                        "warehouse_name": "Main Warehouse",
                        "quantity": 150
                    },
                    {
                        "warehouse_id": 2,
                        "warehouse_name": "Secondary Warehouse",
                        "quantity": 100
                    }
                ]
            }
        ],
        "meta": {
            "totalItems": 1,
            "itemCount": 1,
            "itemsPerPage": 20,
            "totalPages": 1,
            "currentPage": 1
        }
    }
}
```

---

# 3. Lot/Batch Suggestion

แนะนำการเบิกจ่ายตามกลยุทธ์ (FIFO, FEFO, LIFO)

## 📌 Endpoint
`GET /v1/inventory/balance/lot-batch`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | Yes | รหัสวัสดุ |
| warehouse_id | number | No | กรองตามรหัสคลังสินค้า |
| strategy | string (enum) | No | กลยุทธ์ (FIFO, FEFO, LIFO) (default = FIFO) |
| quantity_needed | number | No | จำนวนที่ต้องการเบิก (ระบบจะคำนวณ suggested_quantity ให้) |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/balance/lot-batch?material_id=1&strategy=FIFO&quantity_needed=50`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "inventory_id": 10,
            "material_id": 1,
            "material_name": "Steel Bar",
            "warehouse_id": 1,
            "warehouse_name": "Main Warehouse",
            "quantity": 30,
            "mfg_date": "2023-01-01T00:00:00.000Z",
            "exp_date": "2024-01-01T00:00:00.000Z",
            "order_number": "LOT-OLD-01",
            "suggested_quantity": 30
        },
        {
            "inventory_id": 15,
            "material_id": 1,
            "material_name": "Steel Bar",
            "warehouse_id": 1,
            "warehouse_name": "Main Warehouse",
            "quantity": 100,
            "mfg_date": "2023-02-01T00:00:00.000Z",
            "exp_date": "2024-02-01T00:00:00.000Z",
            "order_number": "LOT-NEW-02",
            "suggested_quantity": 20
        }
    ]
}
```

---

# 4. Low Stock Alerts

ตรวจสอบสินค้าที่ยอดคงคลังต่ำกว่าจุดสั่งซื้อ (Reorder Point)

## 📌 Endpoint
`GET /v1/inventory/balance/low-stock-alerts`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| warehouse_id | number | No | กรองตามรหัสคลังสินค้า |
| threshold | number | No | กำหนดเกณฑ์จำนวนต่ำสุดเอง (ถ้าไม่ระบุจะใช้ค่าจาก Material Master) |
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนข้อมูลต่อหน้า (default = 20) |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/balance/low-stock-alerts`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "data": [
            {
                "material_id": 5,
                "material_name": "Screw 5mm",
                "warehouse_id": 1,
                "warehouse_name": "Main Warehouse",
                "current_quantity": 10,
                "reorder_point": 100,
                "shortage_quantity": 90,
                "is_critical": true
            }
        ],
        "meta": {
            "totalItems": 1,
            "itemCount": 1,
            "itemsPerPage": 20,
            "totalPages": 1,
            "currentPage": 1
        }
    }
}
```

---

# 5. Check Stock Availability

ตรวจสอบว่าสินค้ามีเพียงพอตามจำนวนที่ต้องการหรือไม่

## 📌 Endpoint
`GET /v1/inventory/balance/check-availability/:materialId/:warehouseId`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| quantity | number | Yes | จำนวนที่ต้องการตรวจสอบ |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/balance/check-availability/1/1?quantity=200`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "available": false,
        "currentQuantity": 150,
        "shortage": 50
    }
}
```
