# Purchase Order & Supplier Performance System

This document outlines the workflow for using the Procurement Intelligence features.

## 1. Procurement Intelligence Dashboard
**Location:** `Super Admin > Procurement`

This is the central hub for making purchasing decisions.

### Features:
1.  **Suggested Orders (Left Column)**:
    *   The system scans inventory levels and identifies items falling below safe stock.
    *   It checks if there are already pending orders.
    *   It displays a card for each recommended material.
    *   **Action**: Click "Create PO" to open the order creation dialog.

2.  **Creation Logic**:
    *   The dialog automatically pre-fills the Material and Suggested Quantity.
    *   You can select a Supplier (list fetched from Supplier Database).
    *   Upon confirmation, a new Purchase Order is created with status `PENDING`.

3.  **Recent Purchase Orders (Right Column)**:
    *   Tracks the status of recent orders (`PENDING`, `DELIVERED`, `DELAYED`).
    *   Helps you gain quick visibility into what's coming.

## 2. Supplier Performance Tracking
**Location:** `Super Admin > Suppliers > [Select Supplier]`

View detailed performance metrics for each supplier to decide who to trust.

### Metrics Tracked:
*   **On-Time Delivery %**: Percentage of orders delivered on or before the expected date.
*   **Late Deliveries**: Count of orders that missed the deadline.
*   **Avg Delay Duration**: Average number of days late.
*   **Total Orders**: Volume of business with this supplier.

### How it works:
*   When a PO is marked as `DELIVERED`, the system compares `Actual Delivery Date` vs `Expected Delivery Date`.
*   This data aggregates over time to build the supplier's profile.

## 3. Production Stoppage Prevention (Impact Analysis)
**Feature:** Automatic Risk Detection

*   **Goal**: Prevent production lines from stopping due to missing material.
*   **Mechanism**:
    *   When a Purchase Order is updated (e.g., Supplier says "We are late"), the system can check for impact.
    *   It looks for **Active Production Plans** (`PENDING` or `PRODUCTION` status) that utilize the material in the delayed PO.
    *   If `Plan Start Date` < `New Delivery Date`, a conflict is identified.
*   **Usage**: 
    *   Update PO dates in the system.
    *   The system (via `check-impact` API) identifies compromised plans.
    *   (Future UI update will display these warnings prominently on the PO detail page).

## 4. Data Seeding (Demo)
**Button:** `Seed Mock Data` on Procurement Dashboard.

*   Generates 50+ historical Purchase Orders with mixed statuses (On-time, Late, Early).
*   Allows you to immediately see charts and performance metrics in the Supplier Detail page without manual data entry.
