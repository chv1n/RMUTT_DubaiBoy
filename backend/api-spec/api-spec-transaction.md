# Inventory Transaction API Specification

เอกสารอธิบาย API สำหรับการบันทึกรายการเคลื่อนไหวสินค้า (Transaction) รับเข้า, จ่ายออก, โอนย้าย, และปรับปรุงยอด
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Goods Receipt (IN)

บันทึกการรับวัสดุและอุปกรณ์เข้าคลัง (Goods Receipt)

## 📌 Endpoint
`POST /v1/inventory/transactions/goods-receipt`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | Yes | รหัสวัสดุ |
| warehouse_id | number | Yes | รหัสคลังสินค้าที่จะรับเข้า |
| quantity | number | Yes | จำนวนที่รับเข้า (ต้องมากกว่า 0) |
| reference_number | string | No | เลขที่เอกสารอ้างอิง |
| reason_remarks | string | No | เหตุผลหรือหมายเหตุ |
| mfg_date | date | No | วันที่ผลิต |
| exp_date | date | No | วันที่หมดอายุ |
| order_number | string | No | เลขที่ Lot/Batch |

## 🧪 Example Body
```json
{
    "material_id": 1,
    "warehouse_id": 1,
    "quantity": 100,
    "reference_number": "PO-2023-001",
    "reason_remarks": "Received from supplier",
    "order_number": "LOT-A1"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "Goods receipt recorded successfully",
    "data": {
        "id": 1,
        "transaction_type": "IN",
        "quantity_change": 100,
        "reference_number": "PO-2023-001",
        "reason_remarks": "Received from supplier",
        "transaction_date": "2023-12-09T10:00:00.000Z",
        "created_at": "2023-12-09T10:00:00.000Z"
    }
}
```

---

# 2. Goods Issue (OUT)

บันทึกการเบิกจ่ายวัสดุออกจากคลัง (Goods Issue)

## 📌 Endpoint
`POST /v1/inventory/transactions/goods-issue`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | Yes | รหัสวัสดุ |
| warehouse_id | number | Yes | รหัสคลังสินค้าที่จะเบิกออก |
| quantity | number | Yes | จำนวนที่เบิกออก (ต้องมากกว่า 0) |
| reference_number | string | Yes | เลขที่เอกสารอ้างอิง (จำเป็นต้องระบุ) |
| reason_remarks | string | No | เหตุผลหรือหมายเหตุ |

## 🧪 Example Body
```json
{
    "material_id": 1,
    "warehouse_id": 1,
    "quantity": 20,
    "reference_number": "REQ-2023-050",
    "reason_remarks": "For production usage"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "Goods issue recorded successfully",
    "data": {
        "id": 2,
        "transaction_type": "OUT",
        "quantity_change": -20,
        "reference_number": "REQ-2023-050",
        "reason_remarks": "For production usage",
        "transaction_date": "2023-12-09T11:00:00.000Z",
        "created_at": "2023-12-09T11:00:00.000Z"
    }
}
```

---

# 3. Warehouse Transfer

โอนย้ายสินค้าระหว่างคลัง (Transfer)

## 📌 Endpoint
`POST /v1/inventory/transactions/transfer`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | Yes | รหัสวัสดุ |
| source_warehouse_id | number | Yes | รหัสคลังสินค้าต้นทาง |
| target_warehouse_id | number | Yes | รหัสคลังสินค้าปลายทาง |
| quantity | number | Yes | จำนวนที่โอนย้าย (ต้องมากกว่า 0) |
| reference_number | string | No | เลขที่เอกสารอ้างอิง |
| reason_remarks | string | No | เหตุผลหรือหมายเหตุ |

## 🧪 Example Body
```json
{
    "material_id": 1,
    "source_warehouse_id": 1,
    "target_warehouse_id": 2,
    "quantity": 50,
    "reference_number": "TR-2023-005",
    "reason_remarks": "Refill stock at warehouse 2"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "Warehouse transfer completed successfully",
    "data": {
        "transfer_out_transaction_id": 3,
        "transfer_in_transaction_id": 4,
        "material_id": 1,
        "source_warehouse_id": 1,
        "target_warehouse_id": 2,
        "quantity": 50,
        "message": "Transfer completed successfully"
    }
}
```

---

# 4. Inventory Adjustment

ปรับปรุงยอดคงคลัง (Adjustment) กรณีของหาย, นับสต็อกไม่ตรง, หรือเจอของเกิน

## 📌 Endpoint
`PUT /v1/inventory/transactions/adjustment`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | Yes | รหัสวัสดุ |
| warehouse_id | number | Yes | รหัสคลังสินค้า |
| quantity_change | number | Yes | จำนวนที่ต้องการปรับปรุง (+ เพื่อเพิ่ม, - เพื่อลด) |
| reason_remarks | string | Yes | เหตุผลในการปรับปรุง (จำเป็นต้องระบุ) |
| reference_number | string | No | เลขที่เอกสารอ้างอิง |

## 🧪 Example Body
```json
{
    "material_id": 1,
    "warehouse_id": 1,
    "quantity_change": -5,
    "reason_remarks": "Damaged items found during audit",
    "reference_number": "COUNT-2023-Q4"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "Inventory adjustment recorded successfully",
    "data": {
        "id": 5,
        "transaction_type": "ADJUSTMENT_OUT",
        "quantity_change": -5,
        "reference_number": "COUNT-2023-Q4",
        "reason_remarks": "Damaged items found during audit",
        "transaction_date": "2023-12-09T14:00:00.000Z",
        "created_at": "2023-12-09T14:00:00.000Z"
    }
}
```
