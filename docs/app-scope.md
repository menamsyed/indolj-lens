# Indolj Merchant POS — Application Scope & Vision

## 1. Executive Summary

**Indolj Merchant POS** is an offline-ready, high-speed Point-of-Sale (POS) and store management mobile application built for restaurant owners, store managers, and counter cashiers operating on the Indolj platform.

The application turns mobile and tablet devices into high-performance merchant hubs capable of managing real-time order processing, till/work-period operations, menu stock toggles, and business analytics with maximum speed and zero friction.

---

## 2. Target Personas & Operating Environment

### Target Personas

| Persona | Primary Goal | Target Operating Device |
| --- | --- | --- |
| **Cashier / Counter Staff** | Rapid order entry, fast ticket edits, split/cash checkout | Handheld POS terminal or Countertop Tablet |
| **Store Manager** | Till management, item stock toggling, work period closure | Personal Mobile Phone or Manager Tablet |
| **Kitchen / Fulfillment Team** | Live prep status updates and order completion alerts | Kitchen Display Tablet or Counter Display |

---

## 3. Functional Modules Breakdown

### A. Authentication & Permission Control
- Merchant authentication supporting email/passcode login.
- Granular permission enforcement (`POS`, `Order edit`, `Daily Report`, `Work period`, etc.).
- Persistent token management with automatic session restoration.

### B. Live Order Queue & Dispatch
- Order tracking across stages (`New` ➔ `Preparing` ➔ `Ready` ➔ `Dispatched` / `Completed`).
- Instant order actions (Accept, Print Ticket, Mark Ready, Cancel/Refund).
- Visual and audio notifications for urgent incoming orders.

### C. Menu & Inventory Control (86'ing Items)
- 1-tap item and modifier stock availability toggles (In Stock / Out of Stock / 86'd).
- Category-level availability management during peak operating hours.

### D. Till & Work Period Operations
- Shift opening/closing workflows with cash drawer balance validation.
- Staff sales limit and FOC (Free of Charge) limit enforcement.

### E. Dynamic POS Widget Dashboard & Analytics
- **Live Sales Overview**: Gross Sale, Net Sale, Tax, Discounts, Refund, FOC metrics cards.
- **Order Insights & Channel Distribution**: Channel breakdown (Takeaway, Dine In, Delivery, Food Panda) with customer counts.
- **Hourly Sales & Orders Summary**: Peak hours visualization highlighting high-volume sales windows.
- **Tabular Sales Breakdown**: Item Wise Sales, Category Wise Sales, and Branch Wise Sales tabular matrices with string/number cell parsing (`parseNumber`).
- **Branch Switcher & Date Range Engine**: Reactive branch filter (Sales Demo, North Nazimabad, etc.) and date range presets (Today, Yesterday, This Week, This Month) updating all 17 POS widgets simultaneously.
