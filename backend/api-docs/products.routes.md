# Products Catalog Endpoints

## 1. Create Product
**Endpoint:** `/api/v1/products`
**Method:** `POST`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Description
Registers a new product entity into the active catalog. Validates barcode uniqueness if provided. Defaults `minThreshold` to `0` and `taxRate` to `19.00` if omitted.

### Headers Required
```http
Authorization: Bearer <JWT_TOKEN>
```

### Request Body
**Content-Type:** `application/json`
```json
{
  "name": "Clavier Mecanique RGB",
  "barcode": "6191234567890",
  "category": "Peripheriques",
  "purchasePrice": 45.500,
  "sellingPrice": 89.900,
  "minThreshold": 5.000,
  "taxRate": 19.00
}
```

### Successful Response
**Status:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "barcode": "6191234567890",
    "name": "Clavier Mecanique RGB",
    "category": "Peripheriques",
    "purchasePrice": "45.500",
    "sellingPrice": "89.900",
    "minThreshold": "5.000",
    "taxRate": "19.00",
    "createdAt": "2026-04-05T00:00:00.000Z"
  }
}
```

### Error Responses
**Status:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Payload Validation: name, purchasePrice, and sellingPrice are required fields."
}
```

**Status:** `409 Conflict`
```json
{
  "success": false,
  "message": "A product with this barcode already exists in the catalog."
}
```

---

## 2. Retrieve All Products
**Endpoint:** `/api/v1/products`
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
      "barcode": "6191234567890",
      "name": "Clavier Mecanique RGB",
      "category": "Peripheriques",
      "purchasePrice": "45.500",
      "sellingPrice": "89.900",
      "minThreshold": "5.000",
      "taxRate": "19.00",
      "createdAt": "2026-04-05T00:00:00.000Z"
    }
  ]
}
```

---

## 3. Retrieve Product by ID
**Endpoint:** `/api/v1/products/:id`
**Method:** `GET`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "barcode": "6191234567890",
    "name": "Clavier Mecanique RGB",
    "category": "Peripheriques",
    "purchasePrice": "45.500",
    "sellingPrice": "89.900",
    "minThreshold": "5.000",
    "taxRate": "19.00",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "inventory": [
      {
        "quantity": "100.000",
        "warehouse": { "id": "uuid-string", "name": "Entrepot Principal" }
      }
    ]
  }
}
```

**Status:** `404 Not Found`
```json
{
  "success": false,
  "message": "No product found matching the provided identifier."
}
```

---

## 4. Update Product
**Endpoint:** `/api/v1/products/:id`
**Method:** `PUT`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Request Body (Partial)
```json
{
  "sellingPrice": 99.900,
  "category": "Informatique"
}
```

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "barcode": "6191234567890",
    "name": "Clavier Mecanique RGB",
    "category": "Informatique",
    "purchasePrice": "45.500",
    "sellingPrice": "99.900",
    "minThreshold": "5.000",
    "taxRate": "19.00",
    "updatedAt": "2026-04-05T00:00:00.000Z"
  }
}
```

---

## 5. Soft Delete Product
**Endpoint:** `/api/v1/products/:id`
**Method:** `DELETE`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Product has been soft-deleted from the active catalog.",
  "data": {
    "id": "uuid-string",
    "name": "Clavier Mecanique RGB",
    "deletedAt": "2026-04-05T00:00:00.000Z"
  }
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
