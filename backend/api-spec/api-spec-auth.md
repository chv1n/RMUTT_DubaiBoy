# Auth API Specification

เอกสารอธิบาย API สำหรับการยืนยันตัวตน (Authentication)
Response ทั้งหมดจะถูกห่อหุ้มด้วยรูปแบบมาตรฐาน (Standard Response Format)

---

# 1. Login

เข้าสู่ระบบเพื่อรับ Access Token และ Refresh Token (ในรูปแบบ HttpOnly Cookie)

## 📌 Endpoint
`POST /auth/login`

## 📦 Request Body
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| username | string | Yes | ชื่อผู้ใช้งาน |
| password | string | Yes | รหัสผ่าน |

## 🧪 Example Body
```json
{
    "username": "user1",
    "password": "password123"
}
```

## ✅ Success Response
Response จะมีการ Set-Cookie: `access_token` และ `refresh_token`

```json
{
    "message": "Login Successful!!",
    "data": {
        "id": 1,
        "email": "user@example.com",
        "username": "user1",
        "fullname": "User One",
        "role": "USER",
        "is_active": true,
    }
}
```

---

# 2. Refresh Token

ขอ Access Token ใหม่ด้วย Refresh Token (ส่งมาทาง Cookie)

## 📌 Endpoint
`POST /auth/refresh`

## 🔐 Headers / Cookies
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| Cookie | string | Yes | `refresh_token` ต้องถูกส่งมาด้วย |

## ✅ Success Response
Response จะมีการ Set-Cookie: `access_token` และ `refresh_token` ใหม่

```json
{
    "success": true,
    "message": "Refresh Successful!!",
    "data": {}
}
```

---

# 3. Logout

ออกจากระบบ (ลบ Token ใน Redis และเคลียร์ Cookies)

## 📌 Endpoint
`POST /auth/logout`

## 🔐 Headers
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | Bearer Token (Access Token) |

## ✅ Success Response
Response จะทำการ Clear Cookie

```json
{
    "success": true,
    "message": "Logout Successful!!",
    "data": {}
}
```
