# System Settings & Legal Configuration API

The System Settings API governs the overarching global behavior of the application natively, handling dynamic TVA algorithms, tax stamps (Timbre Fiscal), and the business legal identifiers generated onto structural documents natively.

**Base URL:** `/api/v1/settings`

## 1. Retrieve Global System Configuration

Fetches the centralized physical configuration state.

* **URL Path:** `/`
* **Method:** `GET`
* **RBAC Restrictions:** Restricted to `SuperAdmin`, `Manager`, and `Accountant`

### Response Structure (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "uuid-system-settings",
    "defaultTva": 19.00,
    "timbreFiscalPrice": 1.000,
    "companyName": "Aegis ERP",
    "matriculeFiscal": "1234567X/A/M/000",
    "companyAddress": "Zone Industrielle Route X"
  }
}
```

## 2. Update System Architecture Offsets

Permits overwriting the global legal parameters impacting the entire structural matrix of the backend schema natively.

* **URL Path:** `/`
* **Method:** `PUT`
* **RBAC Restrictions:** Restricted to `SuperAdmin` exclusively.

### Request Body Configuration
```json
{
  "defaultTva": 19.00,
  "timbreFiscalPrice": 1.000,
  "companyName": "Aegis Corporation",
  "matriculeFiscal": "778899X/B/N/111",
  "companyAddress": "Megrine Business Center"
}
```

### Response Structure (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "uuid-system-settings",
    "defaultTva": 19.00,
    "timbreFiscalPrice": 1.000,
    "companyName": "Aegis Corporation",
    "matriculeFiscal": "778899X/B/N/111",
    "companyAddress": "Megrine Business Center"
  }
}
```

### Known Bounds & Guardrails
- Automatically creates a native fallback constraint object if the Database somehow wipes the singular Settings Record explicitly.
- Any update operation natively generates an `audit` record mapping the exact SuperAdmin who executed the modification.
