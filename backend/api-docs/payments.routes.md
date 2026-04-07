# Payments Ledger API

This module enables the recording of financial payments against validated sales documents, mathematically reducing client debt and updating document statuses autonomously.

**Base URL:** `/api/v1/payments`

---

## 1. Record a Client Payment
**Endpoint:** `POST /api/v1/payments`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`

Registers a payment against a `VALIDATED` document. Executes the following business logic:
- Validates that the document is not a `DRAFT`.
- Ensures the payment amount is positive.
- Prevent overpayments (Sum of payments cannot exceed Document `totalTTC`).
- Decrements the linked `Client.balance` by the payment amount.
- **Auto-State Shift**: If the document is fully paid, status transitions to `PAID`.

### Target Payload Structure
```json
{
  "documentId": "doc-uuid",
  "amount": 1500.500,
  "method": "CASH", 
  "date": "2026-04-06T14:30:00Z"
}
```
*Note:* Valid methods include `CASH`, `CHQ`, `VIREMENT`, `TPE`.

### Success Response `(201 Created)`
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid",
    "amount": 1500.500,
    "method": "CASH",
    "clientId": "client-uuid"
  }
}
```

---

## 2. Global Payment Registry Reader
**Endpoint:** `GET /api/v1/payments`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`, `POS_User`

Returns a list of all payments. Supports filtering by query parameters.

### Query Parameters
- `clientId`: Filter trace by specific Client ID.
- `documentId`: Filter trace by specific Document ID.

### Sample Response `(200 OK)`
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-uuid",
      "amount": 500,
      "method": "CASH",
      "client": { "companyName": "Alpha Corp" },
      "document": { "documentNum": "FACT-100", "type": "FACTURE" }
    }
  ]
}
```
