# Authentication Service Endpoints

## 1. User Verification & JWT Exchange
**Endpoint:** `/api/v1/auth/login`
**Method:** `POST`
**Access:** `Public`

### Description
Authenticates an existing active user utilizing cryptographically secure `bcrypt` validation and returns a natively signed `JSON Web Token (JWT)` corresponding securely to their exact UUID and RBAC role.

### Request Body
**Content-Type:** `application/json`
```json
{
  "email": "admin@aegris.com",
  "password": "secret_password_here"
}
```

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string-here",
      "email": "admin@aegris.com",
      "role": "SuperAdmin",
      "permissions": { "all": true }
    },
    "token": "eyJh...JWT...SEQUENCE"
  }
}
```

### Error Responses
**Status:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Payload Error: Email and password strings are mandatorily required"
}
```

**Status:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid credentials provided"
}
```

**Status:** `403 Forbidden`
```json
{
  "success": false,
  "message": "Access denied: Account has been administratively deactivated"
}
```
