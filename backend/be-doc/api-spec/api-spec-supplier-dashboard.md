# Supplier Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard ของผู้จัดจำหน่าย (Supplier) เพื่อวิเคราะห์ยอดการสั่งซื้อและประสิทธิภาพ

---

# 1. Supplier Summary Stats

ดึงข้อมูลสถิติภาพรวมของผู้จัดจำหน่ายและการใช้จ่าย

## 📌 Endpoint
`GET /suppliers/stats/summary`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "data": {
        "total_suppliers": 50,
        "active_suppliers": 45,
        "total_spend_ytd": 2500000,
        "active_suppliers_trend": 2,
        "total_spend_trend": 10.5
    }
}
```

---

# 2. Spending Analytics

ดึงข้อมูลวิเคราะห์การใช้จ่ายแยกตามหมวดหมู่หรือรายเดือน

## 📌 Endpoint
`GET /suppliers/stats/spending`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| type | string | Yes | ประเภทการวิเคราะห์: 'monthly', 'category' |

## ✅ Success Response
```json
{
    "success": true,
    "data": [
        { "category": "Electronics", "amount": 120000 },
        { "category": "Mechanical", "amount": 80000 }
    ]
}
```

---

# 3. Top Performing Suppliers

ดึงข้อมูลผู้จัดจำหน่ายที่มีมียอดการสั่งซื้อสูงสุด

## 📌 Endpoint
`GET /suppliers/stats/top-performing`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "data": [
        {
            "supplier_id": 1,
            "supplier_name": "Supplier A",
            "total_spend": 500000,
            "rating": 0,
            "status": "active"
        }
    ]
}
```
