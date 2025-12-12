# Analytics Prediction API Specification

เอกสารอธิบาย API สำหรับหน้า Analytics Dashboard (Predictive Analytics)
ใช้สำหรับทำนายแนวโน้มการใช้วัตถุดิบในอนาคต

---

# 1. Predict Material Usage

ทำนายปริมาณการใช้วัตถุดิบสำหรับวันที่ระบุในอนาคต โดยอ้างอิงจากข้อมูลประวัติการใช้งาน

## 📌 Endpoint
`POST /analytics/predict/material`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| material_id | number | Yes | ID ของวัตถุดิบที่ต้องการทำนาย |
| target_date | string | Yes | วันที่ที่ต้องการทำนาย (YYYY-MM-DD) |

## 🧪 Example Request Body
```json
{
    "material_id": 101,
    "target_date": "2024-04-15"
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "Prediction successful",
    "data": {
        "material_id": 101,
        "material_name": "Steel Sheet A4",
        "target_date": "2024-04-15",
        "predicted_usage": 150.5,
        "confidence_score": 0.92,
        "unit": "Sheet",
        "trend_analysis": "Increasing",
        "factors": ["Seasonality", "Production Plan Q2"],
        "historical_data": [
            { "date": "2024-04-01", "usage": 120 },
            { "date": "2024-04-02", "usage": 130 },
            { "date": "2024-04-03", "usage": 125 },
            ...
        ],
        "forecast_data": [
            { "date": "2024-04-10", "predicted": 140 },
             ...
            { "date": "2024-04-15", "predicted": 150.5 }
        ]
    }
}
```

---

# 2. Get Material Prediction Overview

ดึงรายชื่อวัตถุดิบพร้อมค่าทำนายเบื้องต้นสำหรับช่วงเวลาสั้นๆ (เช่น 7 วันข้างหน้า) เพื่อแสดงในตารางรวม

## 📌 Endpoint
`GET /analytics/predict/overview`

## 🧪 Example Request
`GET http://localhost:3000/analytics/predict/overview`

## ✅ Success Response
```json
{
    "success": true,
    "data": [
        {
            "material_id": 101,
            "material_name": "Steel Sheet A4",
            "current_stock": 500,
            "predicted_7d_usage": 800,
            "status": "Critical", // Critical if predicted > stock
            "trend_sparkline": [120, 130, 140, 135, 150, 160, 165]
        },
        {
            "material_id": 102,
            "material_name": "Aluminum Rod",
            "current_stock": 2000,
            "predicted_7d_usage": 500,
            "status": "Safe",
            "trend_sparkline": [50, 55, 52, 58, 60, 55, 62]
        }
    ]
}
```
