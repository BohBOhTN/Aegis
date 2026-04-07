# Aegis ERP: Comprehensive End-To-End Testing Documentation

This document serves as the formal architectural validation mapping for the core Aegis ERP lifecycle. It details the exact business processes that strictly execute beneath the integration testing layer to prove system infallibility. The backend test suite currently maps 13 distinct testing integration matrices containing 53 explicit business constraints natively.

## 1. Core Security & Authentication Array
**Target File**: `auth.test.ts`

**Business Logic Validated**: 
1. **Malicious Auth Interception**: Verifies that JWT creation endpoints strictly bounce requests missing structurally required credentials (email, password).
2. **Cryptographic Consistency**: Validates that submitting correct credentials successfully maps the backend BCrypt execution, yielding a securely encrypted JWT with correct RBAC roles natively injected.

---

## 2. Global Entity & Directory Arrays

### Client Ledger Core
**Target File**: `clients.test.ts`

**Business Logic Validated**: 
1. **RBAC Guardrails**: Proves that unauthenticated users or users with inadequate clearance (e.g., Inventory Clerks) are immediately blocked from performing Client mutations.
2. **POS Privileges**: Authorizes Point-Of-Sale users to create clients dynamically during checkout, while strictly denying them deletion privileges natively.
3. **Information Integrity**: Safely rejects Client entities completely missing organizational identifiers (`companyName`, `type`) or providing disjointed Enum types.
4. **Email Decoupling**: Ensures that Emails are globally unique across differing profiles while perfectly allowing `null` injections for traditional street customers.
5. **Architectural Financial Protection**: Absolutely denies any execution aiming to delete a Client whose global `balance` evaluates to greater than zero, ensuring no debt is algorithmically lost.

### Logistics Catalogs (Products, Categories, Units, Suppliers)
**Target Files**: `products.test.ts`, `categories.test.ts`, `units.test.ts`, `suppliers.test.ts`

**Business Logic Validated**: 
1. **Payload Strictness**: Evaluates POST boundaries across backend routes, structurally ensuring native rejections when authentication tokens or explicitly required DB attributes are missing.

---

## 3. Supply Chain & Logistics Array

### Internal Inventory Dynamics
**Target File**: `inventory.test.ts`

**Business Logic Validated**: 
1. **Physical Transfer Physics**: Rejects transfer parameters natively if either origin or destination mappings fail to exist.
2. **Zero-Sum Algorithms**: Executes physical database shifting (Warehouse to POS transfers) natively observing that origin stock formally decrements while destination bounds actively increment exactly without data duplication or loss.

### Purchase Execution Ledger
**Target File**: `purchases.test.ts`

**Business Logic Validated**: 
1. **Validation Subroutines**: Prevents validation protocol execution against unknown drafts.
2. **Supplier Stock Aggregation**: Mathematically forces correct increments mapping incoming Bon de Réception documents into designated storage structures cleanly.

---

## 4. Sales & Financial Execution Arrays

### Sales Documents Matrix
**Target File**: `documents.test.ts`

**Business Logic Validated**: 
1. **Native Draft Tax Calculation**: Confirms initial DRAFT state mapping executes HT and TVA multiplication identically.
2. **Ledger Disbursal**: Converting a DRAFT FACTURE correctly isolates and decrements origin logistical stock dynamically while shifting client mathematical `balance` appropriately.
3. **Deficit Blocking**: Algorithmically rejects document Validation requests if origin storage mathematically cannot satisfy the `quantity` requirement without going negative.
4. **Return Optimization (Avoir)**: Acknowledges that returning stock successfully reverse-engineers the process, incrementing Physical Inventory and securely dissolving outstanding Client balance due.

### Financial Payments Ledger
**Target File**: `payments.test.ts`

**Business Logic Validated**: 
1. **Financial RBAC Constraints**: POS users are permitted exclusively to READ payment logs natively but denied execution rights explicitly reserved to higher clearance.
2. **Debt Constraints**: Mathematically blocks negative payments, zero payments, and over-payments (paying mathematically more than the total bound).
3. **Sequential Collections**: Accumulates partial collections sequentially without altering state, correctly auto-transitioning the entire document natively to "PAID" exclusively when constraints reach absolute zero.

---

## 5. End-To-End Macro Integration Arrays

### Milestone v0.4.0: Global Lifecycle Implementation
**Target File**: `integration_scenario.test.ts`

**Business Logic Validated**: 
1. **Macro Execution Loop**: Strings the entire ERP workflow structurally. Maps Client creation, Sales Draft formulation, Validation deduction, and iterative Financial Collections seamlessly sequentially across one overarching test validating complete boundary synchronization.

### Business Macro Subroutines
**Target File**: `business_core_scenarios.test.ts`

**Business Logic Validated**: 
1. **Wholesale B2B Limits**: Evaluates that purchasing from Suppliers increments debt internally, securely warehousing goods before a consequent Bon de Livraison distributes those goods into Sales.
2. **POS Retail Manual Override Flexibility**: Tests that arbitrary, on-the-fly numeric overrides on POS unit prices supersede standard database limits cleanly while retaining correct sequential mathematical tax projections natively.
3. **Violent State Integrity Verification**: Attempts explicitly testing deletion loops natively upon owed financial boundaries and proves the system unconditionally halts execution preserving data.
4. **Volume Aggregation**: Checks that millions in simulated multi-channel traffic correctly parse and offset seamlessly through analytical memory processing constraints.

### Milestone v0.5.0: Treasury & Legal Offset Metrics
**Target File**: `v050_integration.test.ts`

**Business Logic Validated**: 
1. **Dynamic Native Decoupling**: Completely drops fixed tax coding, replacing it with mocked Government settings algorithms executing native 20% offsets and proving subsequent math shifts accurately.
2. **Leakage Vaulting**: Generates physical operating Expenses and calculates daily vaults accurately reflecting Treasury leaks (Collections offset against Supplier Disbursements and Overhead Expenses natively).
3. **Administrative Protection**: Bounces native `GET /audit` log traces directly to `403 Forbidden` if executed beneath `SUPERADMIN` thresholds securing corporate liability natively.
