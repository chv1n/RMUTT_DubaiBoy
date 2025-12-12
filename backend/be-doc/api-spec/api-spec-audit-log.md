# Audit Log API Specification

เอกสารอธิบาย API สำหรับการดูประวัติการเปลี่ยนแปลงข้อมูล (Audit Log)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get All Audit Logs

ดึงข้อมูล Audit Log ทั้งหมด รองรับการแบ่งหน้า (Pagination) และการกรองข้อมูล

## 📌 Endpoint
`GET /v1/audit-logs`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| page | number | No | หมายเลขหน้า (default = 1) |
| limit | number | No | จำนวนข้อมูลต่อหน้า (default = 20) |
| sort_order | string | No | การจัดเรียงข้อมูล (ASC หรือ DESC) (default = DESC) |
| sort_by | string | No | ชื่อฟิลด์ที่ต้องการจัดเรียง (default = created_at) |
| action | string (enum) | No | กรองตามประเภทการกระทำ (CREATE, UPDATE, DELETE, RESTORE, LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, PASSWORD_CHANGE) |
| entity_type | string (enum) | No | กรองตามประเภท Entity (MaterialMaster, Supplier, WarehouseMaster, User, Bom, ProductPlan, PlanList, Auth) |
| entity_id | string | No | กรองตาม ID ของ Entity |
| user_id | number | No | กรองตาม ID ของผู้ใช้ที่ทำการเปลี่ยนแปลง |
| start_date | date | No | วันที่เริ่มต้น (YYYY-MM-DD) |
| end_date | date | No | วันที่สิ้นสุด (YYYY-MM-DD) |

## 🧪 Example Request
`GET http://localhost:3000/v1/audit-logs?action=UPDATE&entity_type=MaterialMaster&page=1&limit=10`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 1,
            "user_id": 1,
            "username": "admin@example.com",
            "action": "UPDATE",
            "entity_type": "MaterialMaster",
            "entity_id": "5",
            "old_values": {
                "material_name": "Steel Bar A",
                "container_min_stock": 50
            },
            "new_values": {
                "material_name": "Steel Bar Grade A",
                "container_min_stock": 100
            },
            "created_at": "2024-12-09T10:30:00.000Z"
        },
        {
            "id": 2,
            "user_id": 1,
            "username": "admin@example.com",
            "action": "CREATE",
            "entity_type": "MaterialMaster",
            "entity_id": "6",
            "old_values": null,
            "new_values": {
                "material_name": "Copper Wire",
                "is_active": true
            },
            "created_at": "2024-12-09T11:00:00.000Z"
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

# 2. Get Audit Log by ID

ดึงข้อมูล Audit Log ตาม ID

## 📌 Endpoint
`GET /v1/audit-logs/:id`

## 🧪 Example Request
`GET http://localhost:3000/v1/audit-logs/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "id": 1,
        "user_id": 1,
        "username": "admin@example.com",
        "action": "UPDATE",
        "entity_type": "MaterialMaster",
        "entity_id": "5",
        "old_values": {
            "material_name": "Steel Bar A",
            "container_min_stock": 50
        },
        "new_values": {
            "material_name": "Steel Bar Grade A",
            "container_min_stock": 100
        },
        "created_at": "2024-12-09T10:30:00.000Z"
    }
}
```

## ❌ Error Response (Not Found)
```json
{
    "success": false,
    "error": {
        "code": "HTTP_404",
        "message": "Audit Log with ID 999 not found"
    }
}
```

---

# Enum Values

## AuditAction
| Value | Description |
| --- | --- |
| CREATE | สร้างข้อมูลใหม่ |
| UPDATE | แก้ไขข้อมูล |
| DELETE | ลบข้อมูล (Soft Delete) |
| RESTORE | กู้คืนข้อมูล |
| LOGIN_SUCCESS | เข้าสู่ระบบสำเร็จ |
| LOGIN_FAILED | เข้าสู่ระบบไม่สำเร็จ |
| LOGOUT | ออกจากระบบ |
| PASSWORD_CHANGE | เปลี่ยนรหัสผ่าน |

## AuditEntity
| Value | Description |
| --- | --- |
| MaterialMaster | วัสดุ/อุปกรณ์ |
| Supplier | ผู้จัดจำหน่าย |
| WarehouseMaster | คลังสินค้า |
| User | ผู้ใช้งาน |
| Bom | Bill of Materials |
| ProductPlan | แผนการผลิต |
| PlanList | รายการแผน |
| Auth | การยืนยันตัวตน |
