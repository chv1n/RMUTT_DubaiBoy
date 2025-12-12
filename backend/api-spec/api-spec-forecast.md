# Forecast API Specification

เอกสารอธิบาย API สำหรับการจัดการระบบพยากรณ์ (Forecast)

---

# 1. Update / Retrain Model

สั่งให้ระบบทำการ Retrain Model โดยใช้ข้อมูลล่าสุดจากแผนการผลิตที่มีสถานะ Completed

## 📌 Endpoint
`POST /forecast/update`

## 📦 Request Body
- ไม่ต้องระบุ Request Body

## ✅ Success Response
Response จะขึ้นอยู่กับ Output ของ Python Script ที่ทำการ Retrain (ปกติจะเป็น JSON แสดงผลลัพธ์การเทรน)

```json
{
    "status": "success",
    "message": "Model retrained successfully",
    "metrics": {
        "mse": 0.12,
        "mae": 0.08
    }
}
```
*(ตัวอย่าง Response อาจแตกต่างไปตาม Implementation ของ Python Script)*

---

# 2. Predict Material Usage

พยากรณ์ปริมาณการใช้วัตถุดิบ (Material Usage) จากยอดการผลิตที่คาดการณ์ของสินค้า

## 📌 Endpoint
`POST /forecast/predict`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| productId | number | Yes | ID ของสินค้าที่ต้องการพยากรณ์ |
| days | number | Yes | จำนวนวันที่ต้องการพยากรณ์ล่วงหน้า |

## 🧪 Example Body
```json
{
    "productId": 1,
    "days": 14 (max 14 days)
}
```

## ✅ Success Response
```json
{

    "success": true,
    "message": "สำเร็จ",
    "data": {
        "product": {
            "product_id": 41,
            "product_name": "Test Die",
            "boms": [
                {
                    "id": 15,
                    "material": {
                        "material_id": 4,
                        "material_group_id": 1,
                        "material_name": "Aluminum Sheet 2mm",
                        "order_leadtime": 7,
                        "container_type_id": 1,
                        "quantity_per_container": 50,
                        "unit_id": 1,
                        "unit": {
                            "unit_id": 1,
                            "unit_name": "test unit",
                            "create_at": "2025-12-06T09:23:15.223Z",
                            "is_active": true,
                            "deleted_at": null
                        },
                        "container_min_stock": 100,
                        "container_max_stock": 300,
                        "lifetime": 24,
                        "lifetime_unit": "month",
                        "is_active": true,
                        "update_date": "2025-12-06T09:25:21.415Z",
                        "cost_per_unit": 12.5,
                        "expiration_date": "2025-12-30T17:00:00.000Z",
                        "supplier_id": 1,
                        "deleted_at": null
                    },
                    "unit_id": 1,
                    "product_id": 41,
                    "material_id": 4,
                    "usage_per_piece": "12",
                    "version": "1",
                    "active": true,
                    "scrap_factor": "20",
                    "created_at": "2025-12-12T09:01:29.616Z",
                    "updated_at": "2025-12-12T09:01:29.616Z",
                    "deleted_at": null
                },
                {
                    "id": 16,
                    "material": {
                        "material_id": 4,
                        "material_group_id": 1,
                        "material_name": "Aluminum Sheet 2mm",
                        "order_leadtime": 7,
                        "container_type_id": 1,
                        "quantity_per_container": 50,
                        "unit_id": 1,
                        "unit": {
                            "unit_id": 1,
                            "unit_name": "test unit",
                            "create_at": "2025-12-06T09:23:15.223Z",
                            "is_active": true,
                            "deleted_at": null
                        },
                        "container_min_stock": 100,
                        "container_max_stock": 300,
                        "lifetime": 24,
                        "lifetime_unit": "month",
                        "is_active": true,
                        "update_date": "2025-12-06T09:25:21.415Z",
                        "cost_per_unit": 12.5,
                        "expiration_date": "2025-12-30T17:00:00.000Z",
                        "supplier_id": 1,
                        "deleted_at": null
                    },
                    "unit_id": 1,
                    "product_id": 41,
                    "material_id": 4,
                    "usage_per_piece": "12",
                    "version": "1",
                    "active": true,
                    "scrap_factor": "20",
                    "created_at": "2025-12-12T09:01:31.764Z",
                    "updated_at": "2025-12-12T09:01:31.764Z",
                    "deleted_at": null
                }
            ],
            "product_type_id": 4,
            "is_active": true,
            "created_at": "2025-12-09T07:52:30.014Z",
            "updated_at": "2025-12-09T07:52:30.014Z"
        },
        "predictions": [
            1020.002685546875
        ],
        "materialUsage": [
            {
                "material_id": 4,
                "material_name": "Aluminum Sheet 2mm",
                "usage_per_piece": "12",
                "total_usage": 12240.0322265625,
                "unit": {
                    "unit_id": 1,
                    "unit_name": "test unit",
                    "create_at": "2025-12-06T09:23:15.223Z",
                    "is_active": true,
                    "deleted_at": null
                }
            },
            {
                "material_id": 4,
                "material_name": "Aluminum Sheet 2mm",
                "usage_per_piece": "12",
                "total_usage": 12240.0322265625,
                "unit": {
                    "unit_id": 1,
                    "unit_name": "test unit",
                    "create_at": "2025-12-06T09:23:15.223Z",
                    "is_active": true,
                    "deleted_at": null
                }
            }
        ]
    }
}
```
