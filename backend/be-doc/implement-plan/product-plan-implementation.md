# Frontend Implementation Plan: Product Plan Module

เอกสารแนะนำการใช้งาน Product Plan API สำหรับ Frontend Developer

---

## 📊 ภาพรวมระบบ

Product Plan คือระบบวางแผนและติดตามการผลิตสินค้า โดยมี workflow ดังนี้:

```
สร้างแผน       ยืนยัน+จอง        เริ่มผลิต         เสร็จสิ้น
(DRAFT)    →    (PENDING)    →   (PRODUCTION)   →   (COMPLETED)
                    ↓                 ↓
               ยกเลิก (CANCELLED)  ยกเลิก (CANCELLED)
```

---

## 🎯 หน้าที่ Frontend ต้องทำ

### Page 1: รายการแผนผลิต (Plan List)

**API ที่ใช้:** `GET /product-plans`

**Features:**
1. แสดงตาราง Plans พร้อม pagination
2. ค้นหาด้วย search box
3. Filter ตาม:
   - Status (DRAFT, PENDING, PRODUCTION, COMPLETED, CANCELLED)
   - Priority (LOW, MEDIUM, HIGH, URGENT)
   - Product
   - Date range
4. Action buttons ตาม status

**Business Logic:**
| Status | Actions ที่แสดง |
|--------|----------------|
| DRAFT | Preview, Confirm, Edit, Delete |
| PENDING | Start, Cancel |
| PRODUCTION | Complete, Cancel |
| COMPLETED | View (readonly) |
| CANCELLED | View (readonly) |

---

### Page 2: สร้างแผนผลิต (Create Plan)

**API ที่ใช้:** 
- `GET /products` - ดึงรายการสินค้า
- `POST /product-plans` - สร้างแผน

**Form Fields:**
```
- product_id (dropdown) *Required - ต้องเลือกสินค้าที่มี BOM
- plan_name (text)
- plan_description (textarea)
- input_quantity (number) - จำนวนที่ต้องการผลิต
- start_date (date picker)
- end_date (date picker)
- plan_priority (dropdown) - LOW/MEDIUM/HIGH/URGENT
```

**Validation:**
- product_id ต้องมี BOM (backend จะ validate)
- end_date >= start_date

---

### Page 3: Preview Plan (ก่อน Confirm)

**API ที่ใช้:** `GET /product-plans/:id/preview`

**แสดงข้อมูล:**
1. **Plan Info:** plan_name, product, input_quantity
2. **Estimated Cost:** ต้นทุนโดยประมาณ
3. **Material Requirements Table:**
   - material_name
   - usage_per_piece (ต่อชิ้น)
   - scrap_factor (% การสูญเสีย)
   - net_quantity (ปริมาณสุทธิ)
   - scrap_quantity (ปริมาณ scrap)
   - required_quantity (ต้องใช้ทั้งหมด)
   - unit_cost, total_cost
   - stock_by_warehouse (dropdown/radio เลือก warehouse)

**UI Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  ข้อมูลแผน: แผนผลิต LED TV 55" x 20 ชิ้น                    │
│  ต้นทุนประมาณ: ฿10,992.00                                   │
├─────────────────────────────────────────────────────────────┤
│  วัสดุที่ต้องใช้                                             │
│  ┌─────────┬────────┬─────────┬────────────────────────────┐│
│  │ วัสดุ    │ ต้องใช้  │ ต้นทุน   │ เลือก Warehouse            ││
│  ├─────────┼────────┼─────────┼────────────────────────────┤│
│  │ Aluminum│ 1,200  │ ฿27,480 │ ○ คลัง A (5,000 available) ││
│  │ Sheet   │        │         │ ● คลัง B (1,500 available) ││
│  │         │        │         │ [Qty: 1000] [Qty: 200]     ││
│  └─────────┴────────┴─────────┴────────────────────────────┘│
│                                                             │
│                         [ยกเลิก]  [ยืนยันแผน]                │
└─────────────────────────────────────────────────────────────┘
```

---

### Page 4: Confirm Plan (ยืนยัน + จอง Stock)

**API ที่ใช้:** `POST /product-plans/:id/confirm`

**UI Logic:**
1. User เลือก warehouse และกรอกจำนวน สำหรับวัสดุแต่ละตัว
2. รวม quantity ต้องเท่ากับ required_quantity ของวัสดุนั้น
3. ส่ง allocations array

**Request Body ที่ต้อง build:**
```javascript
const allocations = [];

// สำหรับ material แต่ละตัว
selectedMaterials.forEach(material => {
    material.selectedWarehouses.forEach(wh => {
        if (wh.quantity > 0) {
            allocations.push({
                material_id: material.material_id,
                warehouse_id: wh.warehouse_id,
                quantity: wh.quantity
            });
        }
    });
});

await api.post(`/product-plans/${planId}/confirm`, { allocations });
```

**Validation Frontend:**
- รวม quantity ของแต่ละ material ต้อง >= required_quantity
- quantity ของแต่ละ warehouse ห้ามเกิน available_quantity

---

### Page 5: Start Production

**API ที่ใช้:** `POST /product-plans/:id/start`

**UI:** Confirmation dialog แล้วกด Start

**สิ่งที่เกิดขึ้น:**
- Status: PENDING → PRODUCTION
- Stock ถูกตัดจริง (quantity ลด, reserved ลด)

---

### Page 6: Complete Plan (เสร็จสิ้น)

**API ที่ใช้:** `POST /product-plans/:id/complete`

**Form:**
```
- actual_produced_quantity (number) *Required
  - ต้อง > 0
  - ต้อง <= input_quantity
```

**แสดงข้อมูลเพิ่มเติม:**
- Yield % = (actual / input) × 100
- ถ้า actual < input → จะคืนวัสดุส่วนเกิน

---

### Page 7: Cancel Plan (ยกเลิก)

**API ที่ใช้:** `POST /product-plans/:id/cancel`

**Form (แยกตาม status):**

**จาก PENDING:**
```
- reason (text) *Required
- ห้ามใส่ actual_produced_quantity
```

**จาก PRODUCTION:**
```
- reason (text) *Required
- actual_produced_quantity (number) *Required
  - Min: 0
  - Max: input_quantity
```

---

### Page 8: Report Dashboard

**API ที่ใช้:** `GET /product-plans/report/summary`

**Query Params:**
```
?period=month&start_date=2024-12-01&end_date=2024-12-31
```

**แสดง:**
- Total plans
- Chart แบ่งตาม status
- Total estimated vs actual cost
- Average yield %

---

## 🔄 State Machine (สำหรับ Frontend)

```javascript
const STATUS_TRANSITIONS = {
    DRAFT: {
        actions: ['preview', 'confirm', 'edit', 'delete'],
        nextStatus: 'PENDING'
    },
    PENDING: {
        actions: ['start', 'cancel'],
        nextStatus: 'PRODUCTION'
    },
    PRODUCTION: {
        actions: ['complete', 'cancel'],
        nextStatus: 'COMPLETED'
    },
    COMPLETED: {
        actions: ['view'],
        nextStatus: null
    },
    CANCELLED: {
        actions: ['view'],
        nextStatus: null
    }
};

function getAvailableActions(status) {
    return STATUS_TRANSITIONS[status]?.actions || [];
}
```

---

## 🎨 UI Color Codes

| Status | Color | Badge |
|--------|-------|-------|
| DRAFT | Gray | ⚪ ร่าง |
| PENDING | Yellow | 🟡 รอดำเนินการ |
| PRODUCTION | Blue | 🔵 กำลังผลิต |
| COMPLETED | Green | 🟢 เสร็จสิ้น |
| CANCELLED | Red | 🔴 ยกเลิก |

| Priority | Color |
|----------|-------|
| LOW | Gray |
| MEDIUM | Blue |
| HIGH | Orange |
| URGENT | Red |

---

## 📝 Error Handling

**Common Errors:**

```javascript
// Status validation errors
"Cannot confirm plan. Status must be DRAFT, current: PENDING"
"Cannot start production. Plan status must be PENDING"

// Stock errors
"Insufficient stock for Material ID 19 in Warehouse ID 2"
"Inventory not found for Material ID 19 in Warehouse ID 5"

// Quantity errors
"actual_produced_quantity (100) cannot exceed input_quantity (20)"
"Insufficient allocation for material Aluminum Sheet"
```

**แนะนำ:** แสดง error message ให้ user เข้าใจและบอกวิธีแก้ไข

---

## 🔗 API Endpoints Summary

| Action | Method | Endpoint |
|--------|--------|----------|
| List Plans | GET | /product-plans |
| Get Plan | GET | /product-plans/:id |
| Create Plan | POST | /product-plans |
| Update Plan | PUT | /product-plans/:id |
| Delete Plan | DELETE | /product-plans/:id |
| Restore Plan | PUT | /product-plans/:id/restore |
| Preview | GET | /product-plans/:id/preview |
| Confirm | POST | /product-plans/:id/confirm |
| Start | POST | /product-plans/:id/start |
| Complete | POST | /product-plans/:id/complete |
| Cancel | POST | /product-plans/:id/cancel |
| Material Req | GET | /product-plans/:id/material-requirements |
| Report | GET | /product-plans/report/summary |
