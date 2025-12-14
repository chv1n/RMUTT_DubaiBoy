# User API Specification

เอกสารอธิบาย API สำหรับจัดการข้อมูลผู้ใช้งาน (User)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Get All Users

ดึงข้อมูลรายการผู้ใช้งานทั้งหมด รองรับการแบ่งหน้า (Pagination) และการกรองข้อมูลเบื้องต้น

## 📌 Endpoint
`GET /users`

## 🔍 Query Parameters
| Name | Type | Description |
| --- | --- | --- |
| page | number | หมายเลขหน้า (default = 1) |
| limit | number | จำนวนข้อมูลต่อหน้า (default = 20) |
| is_active | boolean | สถานะการใช้งาน (true/false) |
| search | string | คำค้นหา (ค้นหาจาก username, fullname, email) |
| sort_field | string | ฟิลด์ที่ใช้จัดเรียงข้อมูล |
| sort_order | string | การจัดเรียงข้อมูล (ASC หรือ DESC) (default = ASC) |

## 🧪 Example Request
`GET http://localhost:3000/users?page=1&limit=10&is_active=true`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": [
        {
            "id": 1,
            "email": "user@example.com",
            "username": "user1",
            "fullname": "User One",
            "role": "USER",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000Z",
             "deleted_at": null
           
        },
        {
            "id": 2,
            "email": "admin@example.com",
            "username": "admin1",
            "fullname": "Admin One",
            "role": "ADMIN",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000Z",
             "deleted_at": null
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

# 2. Get User by ID

ดึงข้อมูลผู้ใช้งานตาม ID

## 📌 Endpoint
`GET /users/:id`

## 🧪 Example Request
`GET http://localhost:3000/users/1`

## ✅ Success Response
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": {
        "id": 1,
        "email": "user@example.com",
        "username": "user1",
        "fullname": "User One",
        "role": "USER",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "deleted_at": null
    }
}
```

## ✅ Success Response (Not Found)
```json
{
    "success": true,
    "message": "สำเร็จ",
    "data": null
}
```

---

# 3. Create User

สร้างผู้ใช้งานใหม่

## 📌 Endpoint
`POST /users`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| email | string | Yes | อีเมล |
| username | string | Yes | ชื่อผู้ใช้งาน |
| fullname | string | Yes | ชื่อ-นามสกุล |
| password | string | Yes | รหัสผ่าน (ต้องมีความยาวอย่างน้อย 6 ตัวอักษร) |
| role | enum | No | สิทธิ์ผู้ใช้งาน (USER, ADMIN, SUPER_ADMIN) default=USER |

## 🧪 Example Body
```json
{
    "email": "newuser@example.com",
    "username": "newuser",
    "fullname": "New User",
    "password": "password123",
}
```

## ✅ Success Response
```json
{
    "success": true,
    "message": "เพิ่มสำเร็จ",
    "data": {
        "id": 31,
        "email": "sg11@gmail.com",
        "username": "g1s",
        "fullname": "peenapat J",
        "role": "USER",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 4. Update User

แก้ไขข้อมูลผู้ใช้งาน

## 📌 Endpoint
`PUT /users/:id`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| email | string | No | อีเมล |
| username | string | No | ชื่อผู้ใช้งาน |
| fullname | string | No | ชื่อ-นามสกุล |
| password | string | No | รหัสผ่านใหม่ |
| role | enum | No | สิทธิ์ผู้ใช้งาน |
| is_active | boolean | No | สถานะการใช้งาน |

## 🧪 Example Body
```json
{
    "fullname": "New Name",
    "is_active": false
}
```

## ✅ Success Response
```json
{
    "message": "แก้ไขสำเร็จ",
    "data": {
        "id": 1,
        "email": "user@example.com",
        "username": "user1",
        "fullname": "New Name",
        "role": "USER",
        "is_active": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "deleted_at": null
    }
}
```

---

# 5. Delete User (Soft Delete)

ลบผู้ใช้งาน (Soft Delete)

## 📌 Endpoint
`DELETE /users/:id`

## 🧪 Example Request
`DELETE http://localhost:3000/users/3`

## ✅ Success Response
```json
{
    "success": true,
    "message": "ลบสำเร็จ",
    "data": {}
}
```

---

# 6. Restore User

กู้คืนผู้ใช้งานที่ถูกลบ

## 📌 Endpoint
`PUT /users/:id/restore`

## 🧪 Example Request
`PUT http://localhost:3000/users/3/restore`

## ✅ Success Response
```json
{
    "success": true,
    "message": "กู้คืนสำเร็จ",
    "data": {}
}
```
