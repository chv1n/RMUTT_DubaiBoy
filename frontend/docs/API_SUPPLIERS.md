# Supplier Management API Specification

This document outlines the API endpoints required for the Supplier Management module.

## Base URL
`/api/v1`

## Authentication
All endpoints require a valid Bearer Token in the Authorization header.
`Authorization: Bearer <token>`

## Endpoints

### 1. Get All Suppliers
Retrieves a list of all suppliers.

- **URL**: `/suppliers`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search by name or email
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Global Tech Supplies",
    "contactPerson": "John Smith",
    "email": "john@globaltech.com",
    "phone": "+1 234 567 890",
    "address": "123 Tech Blvd, Silicon Valley, CA",
    "rating": 4.8,
    "status": "active",
    "category": "Electronics",
    "totalOrders": 150,
    "totalSpent": 500000,
    "lastOrderDate": "2023-12-01",
    "paymentTerms": "Net 30",
    "logoUrl": "https://..."
  }
]
```

### 2. Get Supplier by ID
Retrieves details of a specific supplier.

- **URL**: `/suppliers/:id`
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "id": 1,
  "name": "Global Tech Supplies",
  ...
}
```

### 3. Create Supplier
Creates a new supplier.

- **URL**: `/suppliers`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "New Supplier Co",
  "contactPerson": "Jane Doe",
  "email": "jane@newsupplier.com",
  "phone": "+1 555 000 0000",
  "address": "789 New St",
  "rating": 5,
  "status": "active",
  "category": "General",
  "paymentTerms": "Net 15",
  "logoUrl": "https://..."
}
```
- **Response**: `201 Created`

### 4. Update Supplier
Updates an existing supplier.

- **URL**: `/suppliers/:id`
- **Method**: `PUT`
- **Body**: (Partial object of Create Supplier)
- **Response**: `200 OK`

### 5. Delete Supplier
Deletes a supplier (soft delete recommended).

- **URL**: `/suppliers/:id`
- **Method**: `DELETE`
- **Response**: `200 OK` or `204 No Content`

### 6. Get Supplier Stats
Retrieves dashboard statistics for suppliers.

- **URL**: `/suppliers/stats`
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "totalSuppliers": 50,
  "activeSuppliers": 45,
  "totalSpent": 1500000,
  "topSuppliers": [ ... ],
  "spendingByCategory": [
    { "category": "Electronics", "amount": 500000 },
    ...
  ],
  "monthlySpending": [
    { "month": "Jan", "amount": 100000 },
    ...
  ]
}
```
