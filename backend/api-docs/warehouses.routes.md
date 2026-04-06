# Warehouses Management Endpoints

## 1. Create Warehouse
**Endpoint:** `/api/v1/warehouses`
**Method:** `POST`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Description
Registers a new warehouse location into the system for inventory tracking purposes.

### Headers Required
```http
Authorization: Bearer <JWT_TOKEN>
```

### Request Body
**Content-Type:** `application/json`
```json
{
  "name": "Entrepot Principal",
  "location": "Zone Industrielle Ben Arous"
}
```

### Successful Response
**Status:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "Entrepot Principal",
    "location": "Zone Industrielle Ben Arous",
    "createdAt": "2026-04-05T00:00:00.000Z"
  }
}
```

### Error Responses
**Status:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Payload Validation: name is a required field."
}
```

---

## 2. Retrieve All Warehouses
**Endpoint:** `/api/v1/warehouses`
**Method:** `GET`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "uuid-string",
      "name": "Entrepot Principal",
      "location": "Zone Industrielle Ben Arous",
      "createdAt": "2026-04-05T00:00:00.000Z"
    }
  ]
}
```

---

## 3. Retrieve Warehouse by ID
**Endpoint:** `/api/v1/warehouses/:id`
**Method:** `GET`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Description
Returns a single warehouse with its complete inventory level breakdown per product.

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "Entrepot Principal",
    "location": "Zone Industrielle Ben Arous",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "inventory": [
      {
        "quantity": "100.000",
        "product": { "id": "uuid-string", "name": "Clavier Mecanique RGB", "barcode": "6191234567890" }
      }
    ]
  }
}
```

**Status:** `404 Not Found`
```json
{
  "success": false,
  "message": "No warehouse found matching the provided identifier."
}
```

### Common Error Responses (All Endpoints)
**Status:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Not authorized: Authentication Token Missing"
}
```

**Status:** `403 Forbidden`
```json
{
  "success": false,
  "message": "Role Violation: You do not possess clearance for this action"
}
```
