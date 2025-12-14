# Inventory Reporting API Specification

เอกสารอธิบาย API สำหรับการออกรายงานและตรวจสอบย้อนกลับ (Reporting & Traceability)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Movement History Report

รายงานประวัติการเคลื่อนไหวของสินค้า (เข้า/ออก/โอนย้าย/ปรับปรุง)

## 📌 Endpoint
`GET /v1/inventory/reports/movement-history`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | Yes | รหัสวัสดุ |
| warehouse_id | number | No | กรองตาม ID คลังสินค้า |
| transaction_type | string (enum) | No | ประเภทธุรกรรม (IN, OUT, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT_IN, ADJUSTMENT_OUT) |
| start_date | date | No | วันที่เริ่มต้น (YYYY-MM-DD) |
| end_date | date | No | วันที่สิ้นสุด (YYYY-MM-DD) |
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนข้อมูลต่อหน้า (default = 20) |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/reports/movement-history?material_id=1&page=1&limit=10`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "data": [
            {
                "transaction_id": 1,
                "material_id": 1,
                "material_name": "Steel Bar",
                "warehouse_id": 1,
                "warehouse_name": "Main Warehouse",
                "transaction_type": "IN",
                "quantity_change": 100,
                "reference_number": "GR-20231201-001",
                "reason_remarks": "Initial Stock",
                "transaction_date": "2023-12-01T10:00:00.000Z",
                "created_at": "2023-12-01T10:00:00.000Z"
            }
        ],
        "meta": {
            "totalItems": 1,
            "itemCount": 1,
            "itemsPerPage": 10,
            "totalPages": 1,
            "currentPage": 1
        },
        "summary": {
            "total_in": 100,
            "total_out": 0,
            "net_change": 100
        }
    }
}
```

---

# 2. Inventory Turnover Report

รายงานอัตราการหมุนเวียนของสินค้า

## 📌 Endpoint
`GET /v1/inventory/reports/turnover`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | No | กรองตามรหัสวัสดุ |
| warehouse_id | number | No | กรองตาม ID คลังสินค้า |
| start_date | date | No | วันที่เริ่มต้น (YYYY-MM-DD) |
| end_date | date | No | วันที่สิ้นสุด (YYYY-MM-DD) |
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนข้อมูลต่อหน้า (default = 20) |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/reports/turnover?page=1`

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
                "average_inventory": 500,
                "total_out_quantity": 250,
                "turnover_rate": 0.5,
                "days_in_inventory": 730
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

# 3. Traceability Report

รายงานการตรวจสอบย้อนกลับ (Traceability) จากเลขอ้างอิงหรือเลขที่คำสั่งซื้อ

## 📌 Endpoint
`GET /v1/inventory/reports/traceability`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| reference_number | string | No | เลขที่เอกสารอ้างอิง (เช่น PO No., Invoice No.) |
| order_number | string | No | เลขที่ Lot/Batch หรือ Order Number ของสินค้า |
| material_id | number | No | กรองตามรหัสวัสดุ |
| start_date | date | No | วันที่เริ่มต้น (YYYY-MM-DD) |
| end_date | date | No | วันที่สิ้นสุด (YYYY-MM-DD) |
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนข้อมูลต่อหน้า (default = 20) |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/reports/traceability?reference_number=GR-20231201-001`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "data": [
            {
                "reference_number": "GR-20231201-001",
                "transactions": [
                    {
                        "transaction_id": 1,
                        "material_id": 1,
                        "material_name": "Steel Bar",
                        "warehouse_id": 1,
                        "warehouse_name": "Main Warehouse",
                        "transaction_type": "IN",
                        "quantity_change": 100,
                        "transaction_date": "2023-12-01T10:00:00.000Z",
                        "reason_remarks": "Initial Stock"
                    }
                ],
                "related_orders": [
                    "LOT-2023-001"
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

# 4. Stock Location Report

รายงานยอดคงคลังแยกตามสถานที่เก็บ

## 📌 Endpoint
`GET /v1/inventory/reports/stock-location`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| warehouse_id | number | Yes | รหัสคลังสินค้า |
| search | string | No | คำค้นหาชื่อวัสดุ |
| sort_by | string | No | เรียงตาม (quantity, material_name) |
| sort_order | string | No | ลำดับการเรียง (ASC, DESC) |
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนข้อมูลต่อหน้า (default = 20) |

## 🧪 Example Request
`GET http://localhost:3000/v1/inventory/reports/stock-location?warehouse_id=1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "warehouse_id": 1,
        "warehouse_name": "Main Warehouse",
        "warehouse_code": "WH001",
        "materials": [
            {
                 "material_id": 1,
                 "material_name": "Steel Bar",
                 "quantity": 100,
                 "mfg_date": "2023-01-01T00:00:00.000Z",
                 "exp_date": "2024-01-01T00:00:00.000Z",
                 "order_number": "LOT-001"
            }
        ],
        "total_items": 1
    }
}
```
