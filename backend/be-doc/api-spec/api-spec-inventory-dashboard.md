# Inventory Dashboard API Specification

เอกสารอธิบาย API สำหรับ Dashboard ของการจัดการคลังวัสดุ (Material Inventory) เพื่อแสดงสถิติและแนวโน้ม

---

# 1. Inventory Stats

ดึงข้อมูลสถิติภาพรวมของคลังวัสดุ เช่น มูลค่ารวม, จำนวนรายการ, มูลค่ารับเข้า/เบิกออกวันนี้

## 📌 Endpoint
`GET /inventory/dashboard/stats`

## 📦 Parameters
None

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "total_value": 1500000,
        "total_items": 500,
        "low_stock_items": 10,
        "today_inbound_value": 50000,
        "today_outbound_value": 20000
    }
}
```

---

# 2. Value Trends

ดึงข้อมูลแนวโน้มมูลค่าสินค้าคงคลังในช่วงเวลาที่กำหนด

## 📌 Endpoint
`GET /inventory/dashboard/value-trends`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| range | string | No | ช่วงเวลา (e.g., 'week', 'month') (Default: 'week') |

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        { "date": "2023-10-01", "total_value": 1400000 },
        { "date": "2023-10-02", "total_value": 1450000 }
    ]
}
```

---

# 3. Movement Activity

ดึงข้อมูลการเคลื่อนไหวของสินค้า (รับเข้า/เบิกออก) ตามช่วงเวลา

## 📌 Endpoint
`GET /inventory/dashboard/movement`

## 🔍 Query Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| range | string | No | ช่วงเวลา (e.g., 'week', 'month') (Default: 'week') |

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        { "date": "2023-10-01", "inbound": 50, "outbound": 20 },
        { "date": "2023-10-02", "inbound": 0, "outbound": 40 }
    ]
}
```
