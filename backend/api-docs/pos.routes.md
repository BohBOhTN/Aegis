# Points of Sale Management Endpoints

## 1. Create Point of Sale
**Endpoint:** `/api/v1/pos`
**Method:** `POST`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Description
Registers a new point of sale linked to an existing warehouse. The warehouse serves as the upstream inventory source for the POS location.

### Headers Required
```http
Authorization: Bearer <JWT_TOKEN>
```

### Request Body
**Content-Type:** `application/json`
```json
{
  "name": "Boutique Centre Ville",
  "warehouseId": "uuid-of-existing-warehouse"
}
```

### Successful Response
**Status:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "Boutique Centre Ville",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "warehouse": {
      "id": "uuid-string",
      "name": "Entrepot Principal"
    }
  }
}
```

### Error Responses
**Status:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Payload Validation: name and warehouseId are required fields."
}
```

**Status:** `404 Not Found`
```json
{
  "success": false,
  "message": "No warehouse found matching the provided warehouseId."
}
```

---

## 2. Retrieve All Points of Sale
**Endpoint:** `/api/v1/pos`
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
      "name": "Boutique Centre Ville",
      "createdAt": "2026-04-05T00:00:00.000Z",
      "warehouse": {
        "id": "uuid-string",
        "name": "Entrepot Principal",
        "location": "Zone Industrielle Ben Arous"
      }
    }
  ]
}
```

---

## 3. Retrieve Point of Sale by ID
**Endpoint:** `/api/v1/pos/:id`
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
    "name": "Boutique Centre Ville",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "warehouse": {
      "id": "uuid-string",
      "name": "Entrepot Principal",
      "location": "Zone Industrielle Ben Arous"
    }
  }
}
```

**Status:** `404 Not Found`
```json
{
  "success": false,
  "message": "No point of sale found matching the provided identifier."
}
```

---

## 4. Update Point of Sale
**Endpoint:** `/api/v1/pos/:id`
**Method:** `PUT`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Request Body (Partial)
```json
{
  "name": "Boutique Lac 2",
  "warehouseId": "uuid-of-another-warehouse"
}
```

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "Boutique Lac 2",
    "updatedAt": "2026-04-05T00:00:00.000Z",
    "warehouse": {
      "id": "uuid-string",
      "name": "Entrepot Secondaire"
    }
  }
}
```

---

## 5. Soft Delete Point of Sale
**Endpoint:** `/api/v1/pos/:id`
**Method:** `DELETE`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Point of sale has been soft-deleted from the active directory.",
  "data": {
    "id": "uuid-string",
    "name": "Boutique Centre Ville",
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
