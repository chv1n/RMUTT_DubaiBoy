# Role & Permission Matrix

เอกสารนี้ระบุสิทธิ์การเข้าถึง (Permissions) ในแต่ละ Module แยกตาม Role ของผู้ใช้งาน
เพื่อให้ Frontend นำไป Implement ระบบ Role Based Access Control (RBAC) ได้ถูกต้อง

## 🎭 User Roles

| Role Key | ชื่อเรียก (Display Name) | หน้าที่ความรับผิดชอบ |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Super Admin | ผู้ดูแลระบบสูงสุด ทำได้ทุกอย่าง |
| `ADMIN` | Admin | ผู้ดูแลระบบทั่วไป จัดการ Users และ Master Data พื้นฐาน |
| `PRODUCTION_MANAGER` | Production Manager | ผู้จัดการฝ่ายผลิต ดูแลแผนการผลิต, Product, BOM, Forecast |
| `INVENTORY_MANAGER` | Inventory Manager | ผู้จัดการคลังสินค้า ดูแล Stock, Warehouse, Materials |
| `PURCHASE_MANAGER` | Purchase Manager | ผู้จัดการฝ่ายจัดซื้อ ดูแล Suppliers, Material Costs |
| `USER` | User | ผู้ใช้งานทั่วไป (View Only ในส่วนสำคัญ, ทำงานตามหน้างาน) |

---

## 🔒 Module Permissions

### 1. User Management (`/users`)
จัดการข้อมูลผู้ใช้งานในระบบ

| Action | API Endpoint | Allowed Roles |
| :--- | :--- | :--- |
| **View List** | `GET /users` | `SUPER_ADMIN`, `ADMIN` |
| **View Detail** | `GET /users/:id` | Owner, `SUPER_ADMIN`, `ADMIN` |
| **Create** | `POST /users` | `SUPER_ADMIN`, `ADMIN` |
| **Update** | `PUT /users/:id` | Owner, `SUPER_ADMIN` |
| **Delete/Restore** | `DELETE /users/:id` | `SUPER_ADMIN` |

### 2. Product Planning (`/product-plans`)
จัดการแผนการผลิต

| Action | API Endpoint | Allowed Roles |
| :--- | :--- | :--- |
| **View List** | `GET /product-plans` | All Authenticated Users |
| **Create Plan** | `POST /product-plans` | `SUPER_ADMIN`, `ADMIN` |
| **Update Plan** | `PUT /product-plans/:id` | `SUPER_ADMIN`, `ADMIN`, `PRODUCTION_MANAGER` |
| **Delete Plan** | `DELETE /product-plans/:id` | `SUPER_ADMIN`, `ADMIN`, `PRODUCTION_MANAGER` |
| **Workflow Actions**<br>(Confirm/Start/Complete/Cancel) | `POST /product-plans/:id/*` | `SUPER_ADMIN`, `ADMIN`, `PRODUCTION_MANAGER` |

### 3. Product & BOM (`/products`)
จัดการข้อมูลสินค้าและสูตรการผลิต (Bill of Materials)

| Action | API Endpoint | Allowed Roles |
| :--- | :--- | :--- |
| **View** | `GET /products` | All Authenticated Users |
| **Manage** (Create/Edit/Delete) | `POST`, `PUT`, `DELETE` | `SUPER_ADMIN`, `ADMIN`, `PRODUCTION_MANAGER` |

### 4. Material Management (`/materials`)
จัดการข้อมูลวัตถุดิบ (Master Data)

| Action | API Endpoint | Allowed Roles |
| :--- | :--- | :--- |
| **View** | `GET /materials` | All Authenticated Users |
| **Manage** (Create/Edit/Delete) | `POST`, `PUT`, `DELETE` | `SUPER_ADMIN`, `ADMIN`, `INVENTORY_MANAGER`, `PURCHASE_MANAGER` |

### 5. Warehouse & Inventory (`/warehouses`, `/inventory`)
จัดการคลังสินค้าและยอดคงเหลือ

| Action | API Endpoint | Allowed Roles |
| :--- | :--- | :--- |
| **View Stock** | `GET` | All Authenticated Users |
| **Manage Master Data** | `POST`, `PUT`, `DELETE` (Warehouses) | `SUPER_ADMIN`, `ADMIN`, `INVENTORY_MANAGER` |
| **Stock Adjust/Transfer** | `POST /transactions` | `SUPER_ADMIN`, `ADMIN`, `INVENTORY_MANAGER` |

### 6. Supplier Management (`/suppliers`)
จัดการข้อมูลผู้จัดจำหน่าย

| Action | API Endpoint | Allowed Roles |
| :--- | :--- | :--- |
| **View** | `GET /suppliers` | All Authenticated Users |
| **Manage** | `POST`, `PUT`, `DELETE` | `SUPER_ADMIN`, `ADMIN`, `PURCHASE_MANAGER` |

### 7. Forecast (`/forecast`)
การพยากรณ์ความต้องการใช้วัตถุดิบ

| Action | API Endpoint | Allowed Roles |
| :--- | :--- | :--- |
| **View/Generate** | `GET /forecast` | `SUPER_ADMIN`, `ADMIN`, `PRODUCTION_MANAGER`, `PURCHASE_MANAGER` |

---

## 💻 Frontend Implementation Guideline

### 1. Route Protection
ใช้ Role Guards ในการป้องกันการเข้าถึงหน้า Page ต่างๆ

```typescript
// ตัวอย่าง (Concept)
const RoutePermissions = {
  '/users': ['SUPER_ADMIN', 'ADMIN'],
  '/plans/create': ['SUPER_ADMIN', 'ADMIN'],
  '/plans/edit': ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'],
  '/inventory/adjust': ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'],
};
```

### 2. Component Visibility
ซ่อน/แสดง ปุ่มหรือ Component ตาม Role

- **Edit/Delete Buttons**: แสดงเฉพาะผู้ที่มีสิทธิ์ Manage ใน Module นั้นๆ
- **Create Button**: แสดงเฉพาะผู้ที่มีสิทธิ์ Create
- **Sidebar Menu**: กรองเมนูตาม Role ของผู้ใช้ปัจจุบัน

### 3. Badge & UI Hints
- แสดง Role Badge ที่ชัดเจนในหน้า User Management (ตามที่ Implement แล้ว)
- Disable Input form สำหรับผู้ใช้ที่มีสิทธิ์ View Only

---
*Note: สิทธิ์การเข้าถึง API จริงอ้างอิงตาม `@Auth(...)` decorator ใน Controller Code*
