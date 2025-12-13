# Warehouse Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard ของคลังสินค้า (Warehouse) เพื่อดูปริมาณสต็อกและการกระจายตัว

---

# 1. Warehouse Stats

ดึงข้อมูลสถิติภาพรวมคลังสินค้า เช่น มูลรวม, รายการสินค้า, การแจ้งเตือนสต็อกต่ำ

## 📌 Endpoint
`GET /warehouse/dashboard/stats`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "data": {
        "total_warehouses": 5,
        "active_warehouses": 5,
        "total_inventory_value": 2000000,
        "total_stock_items": 15000,
        "low_stock_alerts": 12,
        "utilization_rate": 0
    }
}
```

---

# 2. Stock Distribution

ดึงข้อมูลการกระจายตัวของสต็อก (มูลค่าและจำนวน) แยกตามคลังสินค้า

## 📌 Endpoint
`GET /warehouse/dashboard/distribution`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "data": [
        {
            "warehouse_name": "Main Warehouse",
            "value": 1200000,
            "item_count": 8000
        },
        {
            "warehouse_name": "Cold Storage",
            "value": 800000,
            "item_count": 7000
        }
    ]
}
```

---

# 3. Capacity Utilization

ดึงข้อมูลอัตราการใช้พื้นที่ของคลังสินค้า (ปัจจุบันค่า Capacity เป็น 0 เนื่องจากข้อจำกัดของ Schema)

## 📌 Endpoint
`GET /warehouse/dashboard/utilization`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "data": [
        {
            "warehouse_name": "Main Warehouse",
            "capacity": 0,
            "used": 0,
            "percentage": 0
        }
    ]
}
```
