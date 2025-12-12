# Product Plan API Specification

เอกสารอธิบาย API สำหรับการจัดการแผนการผลิต (Product Plan) พร้อม Workflow การผลิต

**Base Path:** `/api/v1/product-plans`

---

## 📊 Status Flow Diagram

```
DRAFT → PENDING → PRODUCTION → COMPLETED
                      ↓
                  CANCELLED
```

| Status | คำอธิบาย |
|--------|----------|
| `DRAFT` | สร้างใหม่ ยังไม่ได้ยืนยัน |
| `PENDING` | ยืนยันแล้ว รอเริ่มผลิต (stock ถูกจองแล้ว) |
| `PRODUCTION` | กำลังผลิต (stock ถูกตัดแล้ว) |
| `COMPLETED` | ผลิตเสร็จ |
| `CANCELLED` | ยกเลิก |

---

# 📋 CRUD Endpoints

## 1. Get All Product Plans

ดึงรายการแผนผลิต รองรับ **search, filter, และ pagination**

### 📌 Endpoint
`GET /product-plans`

### 🔍 Query Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนต่อหน้า (default = 10) |
| sort_order | string | No | ASC หรือ DESC (default = ASC) |
| search | string | No | ค้นหา plan_name, plan_description |
| plan_status | string | No | DRAFT, PENDING, PRODUCTION, COMPLETED, CANCELLED |
| plan_priority | string | No | LOW, MEDIUM, HIGH, URGENT |
| product_id | number | No | filter ตาม product |
| start_date_from | string | No | filter start_date >= (YYYY-MM-DD) |
| start_date_to | string | No | filter start_date <= (YYYY-MM-DD) |
| end_date_from | string | No | filter end_date >= (YYYY-MM-DD) |
| end_date_to | string | No | filter end_date <= (YYYY-MM-DD) |

### 🧪 Example Request
```
GET /product-plans?plan_status=PRODUCTION&plan_priority=HIGH&page=1&limit=10
```

### ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "data": [
            {
                "id": 16,
                "product_id": 2,
                "input_quantity": 20,
                "plan_name": "แผนผลิตทดสอบ",
                "plan_description": "ทดสอบ workflow",
                "start_date": "2024-12-15",
                "end_date": "2024-12-20",
                "plan_status": "PRODUCTION",
                "plan_priority": "HIGH",
                "actual_produced_quantity": null,
                "estimated_cost": "10992.00",
                "actual_cost": null,
                "started_at": "2025-12-12T15:28:13.495Z",
                "completed_at": null,
                "cancelled_at": null,
                "cancel_reason": null,
                "created_at": "2025-12-12T14:40:55.557Z",
                "updated_at": "2025-12-12T15:28:13.495Z",
                "deleted_at": null,
                "product": {
                    "product_id": 2,
                    "product_name": "LED TV 55 inch"
                }
            }
        ],
        "meta": {
            "total": 5,
            "page": 1,
            "limit": 10,
            "totalPages": 1
        }
    }
}
```

---

## 2. Get Product Plan by ID

### 📌 Endpoint
`GET /product-plans/:id`

### ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "id": 16,
        "product_id": 2,
        "input_quantity": 20,
        "plan_name": "แผนผลิตทดสอบ",
        "plan_status": "PRODUCTION",
        "plan_priority": "HIGH",
        ...
        "product": { ... }
    }
}
```

---

## 3. Create Product Plan

สร้างแผนผลิตใหม่ (default status = DRAFT)

### 📌 Endpoint
`POST /product-plans`

### 📦 Request Body
| Name | Type | Required | Description |
|------|------|----------|-------------|
| product_id | number | **Yes** | ID สินค้า (ต้องมี BOM) |
| plan_name | string | No | ชื่อแผน |
| plan_description | string | No | รายละเอียด |
| input_quantity | number | No | จำนวนที่ต้องการผลิต |
| start_date | string | No | วันเริ่ม (YYYY-MM-DD) |
| end_date | string | No | วันสิ้นสุด (YYYY-MM-DD) |
| plan_priority | string | No | LOW, MEDIUM, HIGH, URGENT (default = MEDIUM) |
| plan_status | string | No | default = DRAFT |

### 🧪 Example Body
```json
{
    "product_id": 2,
    "plan_name": "แผนผลิต Q1",
    "input_quantity": 100,
    "start_date": "2024-12-15",
    "end_date": "2024-12-31",
    "plan_priority": "HIGH"
}
```

### ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "id": 20,
        "product_id": 2,
        "plan_name": "แผนผลิต Q1",
        "plan_status": "DRAFT",
        "plan_priority": "HIGH",
        ...
    }
}
```

### ❌ Error Response (Product ไม่มี BOM)
```json
{
    "success": false,
    "message": "Product with ID 99 not found in BOM",
    "statusCode": 404
}
```

---

## 4. Update Product Plan

### 📌 Endpoint
`PUT /product-plans/:id`

### 📦 Request Body
ส่งเฉพาะ field ที่ต้องการแก้ไข

### ✅ Success Response
```json
{
    "success": true,
    "message": "แก้ไขสำเร็จ",
    "data": {
        "id": 16,
        "plan_name": "Updated Plan Name",
        ...
    }
}
```

---

## 5. Delete Product Plan (Soft Delete)

### 📌 Endpoint
`DELETE /product-plans/:id`

### ✅ Success Response
```json
{
    "success": true,
    "message": "ลบสำเร็จ",
    "data": {
        "id": 16,
        "deleted_at": "2025-12-12T16:00:00.000Z",
        ...
    }
}
```

---

## 6. Restore Product Plan

### 📌 Endpoint
`PUT /product-plans/:id/restore`

### ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนสำเร็จ",
    "data": {
        "id": 16,
        "deleted_at": null,
        ...
    }
}
```

---

# 🔄 Workflow Endpoints

## 7. Preview Plan (ดูข้อมูลก่อน Confirm)

คำนวณวัสดุที่ต้องใช้ + ต้นทุน + แสดง stock จากแต่ละ warehouse

### 📌 Endpoint
`GET /product-plans/:id/preview`

### ✅ Success Response
```json
{
    "success": true,
    "message": "ดึงข้อมูล preview สำเร็จ",
    "data": {
        "plan_id": 16,
        "plan_name": "แผนผลิตทดสอบ",
        "product_id": 2,
        "input_quantity": 20,
        "estimated_cost": 10992,
        "materials": [
            {
                "material_id": 19,
                "material_name": "Aluminum Sheet",
                "unit_id": 3,
                "unit_name": "กิโลกรัม",
                "usage_per_piece": 50,
                "scrap_factor": 0.2,
                "production_quantity": 20,
                "net_quantity": 1000,
                "scrap_quantity": 200,
                "required_quantity": 1200,
                "unit_cost": 22.9,
                "total_cost": 27480,
                "stock_by_warehouse": [
                    {
                        "inventory_id": 32,
                        "warehouse_id": 2,
                        "warehouse_name": "คลัง A",
                        "available_quantity": 5000
                    },
                    {
                        "inventory_id": 36,
                        "warehouse_id": 3,
                        "warehouse_name": "คลัง B",
                        "available_quantity": 1500
                    }
                ]
            }
        ]
    }
}
```

---

## 8. Confirm Plan (ยืนยัน + จอง Stock)

ยืนยันแผน + เลือก warehouse ที่จะดึงวัสดุ + จอง stock

**Status Change:** `DRAFT` → `PENDING`

### 📌 Endpoint
`POST /product-plans/:id/confirm`

### 📦 Request Body
```json
{
    "allocations": [
        {
            "material_id": 19,
            "warehouse_id": 2,
            "quantity": 1000
        },
        {
            "material_id": 19,
            "warehouse_id": 3,
            "quantity": 200
        },
        {
            "material_id": 20,
            "warehouse_id": 2,
            "quantity": 288
        }
    ]
}
```

### ✅ Success Response
```json
{
    "success": true,
    "message": "ยืนยันแผนผลิตและจอง stock สำเร็จ",
    "data": {
        "id": 16,
        "plan_status": "PENDING",
        "estimated_cost": "10992.00",
        ...
    }
}
```

### ❌ Error Responses
```json
// Status ไม่ใช่ DRAFT
{
    "message": "Cannot confirm plan. Status must be DRAFT, current: PENDING"
}

// Stock ไม่พอ
{
    "message": "Insufficient stock for Material ID 19 in Warehouse ID 2. Available: 500, Required: 1000"
}

// วัสดุไม่ครบ
{
    "message": "Insufficient allocation for material Aluminum Sheet. Required: 1200, Allocated: 1000"
}
```

---

## 9. Start Production (เริ่มผลิต + ตัด Stock)

เริ่มการผลิต + ตัด stock จาก inventory จริง

**Status Change:** `PENDING` → `PRODUCTION`

### 📌 Endpoint
`POST /product-plans/:id/start`

### 📦 Request Body
ไม่ต้องส่ง body

### ✅ Success Response
```json
{
    "success": true,
    "message": "เริ่มการผลิตสำเร็จ",
    "data": {
        "id": 16,
        "plan_status": "PRODUCTION",
        "started_at": "2025-12-12T15:28:13.495Z",
        ...
    }
}
```

### ❌ Error Response
```json
{
    "message": "Cannot start production. Plan status must be PENDING, current: DRAFT"
}
```

---

## 10. Complete Plan (เสร็จสิ้น + คืนวัสดุเหลือ)

บันทึกการผลิตเสร็จ + กรอกจำนวนที่ผลิตได้จริง + คืนวัสดุเหลือ

**Status Change:** `PRODUCTION` → `COMPLETED`

### 📌 Endpoint
`POST /product-plans/:id/complete`

### 📦 Request Body
| Name | Type | Required | Description |
|------|------|----------|-------------|
| actual_produced_quantity | number | **Yes** | จำนวนที่ผลิตได้จริง |

```json
{
    "actual_produced_quantity": 18
}
```

### ✅ Success Response
```json
{
    "success": true,
    "message": "บันทึกการผลิตเสร็จสิ้นสำเร็จ",
    "data": {
        "id": 16,
        "plan_status": "COMPLETED",
        "actual_produced_quantity": 18,
        "actual_cost": "9892.80",
        "completed_at": "2025-12-12T16:00:00.000Z",
        ...
    }
}
```

### ❌ Error Responses
```json
// Status ไม่ใช่ PRODUCTION
{
    "message": "Cannot complete plan. Status must be PRODUCTION, current: PENDING"
}

// ผลิตเกิน input_quantity
{
    "message": "actual_produced_quantity (100) cannot exceed input_quantity (20)"
}
```

---

## 11. Cancel Plan (ยกเลิก + คืน Stock)

ยกเลิกแผน + คืน stock

**Status Change:** `PENDING/PRODUCTION` → `CANCELLED`

### 📌 Endpoint
`POST /product-plans/:id/cancel`

### 📦 Request Body

**จาก PENDING:**
```json
{
    "reason": "เลื่อนการผลิต"
}
```

**จาก PRODUCTION:**
```json
{
    "reason": "วัสดุมีปัญหา",
    "actual_produced_quantity": 5
}
```

| Name | Type | Required | Description |
|------|------|----------|-------------|
| reason | string | **Yes** | เหตุผลการยกเลิก |
| actual_produced_quantity | number | Conditional | **บังคับ** ถ้า cancel จาก PRODUCTION |

### ✅ Success Response
```json
{
    "success": true,
    "message": "ยกเลิกแผนผลิตสำเร็จ",
    "data": {
        "id": 16,
        "plan_status": "CANCELLED",
        "cancel_reason": "เลื่อนการผลิต",
        "cancelled_at": "2025-12-12T16:00:00.000Z",
        ...
    }
}
```

### ❌ Error Responses
```json
// Cancel จาก PENDING แต่ส่ง actual_produced_quantity
{
    "message": "actual_produced_quantity should not be provided when cancelling from PENDING status"
}

// Cancel จาก PRODUCTION แต่ไม่ส่ง actual_produced_quantity
{
    "message": "actual_produced_quantity is required when cancelling from PRODUCTION status"
}

// actual_produced_quantity เกิน input_quantity
{
    "message": "actual_produced_quantity (100) cannot exceed input_quantity (20)"
}
```

---

## 12. Get Material Requirements

ดูวัสดุที่ต้องใช้พร้อมเช็ค stock

### 📌 Endpoint
`GET /product-plans/:id/material-requirements`

### ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "plan_id": 16,
        "plan_name": "แผนผลิตทดสอบ",
        "product_id": 2,
        "input_quantity": 20,
        "all_materials_sufficient": true,
        "insufficient_count": 0,
        "materials": [
            {
                "material_id": 19,
                "material_name": "Aluminum Sheet",
                "required_quantity": 1200,
                "available_stock": 6500,
                "is_sufficient": true,
                "shortage_quantity": 0
            }
        ]
    }
}
```

---

## 13. Get Report Summary

สรุปรายงานการผลิต

### 📌 Endpoint
`GET /product-plans/report/summary`

### 🔍 Query Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| start_date | string | No | วันเริ่ม (YYYY-MM-DD) |
| end_date | string | No | วันสิ้นสุด (YYYY-MM-DD) |
| period | string | No | day, week, month (default = month) |

### 🧪 Example Request
```
GET /product-plans/report/summary?period=month&start_date=2024-12-01
```

### ✅ Success Response
```json
{
    "success": true,
    "message": "ดึงข้อมูลสรุปสำเร็จ",
    "data": {
        "total_plans": 10,
        "by_status": {
            "DRAFT": 2,
            "PENDING": 1,
            "PRODUCTION": 3,
            "COMPLETED": 4,
            "CANCELLED": 0
        },
        "total_estimated_cost": 50000,
        "total_actual_cost": 45000,
        "avg_yield": 92.5
    }
}
```
