# MunafaOS — Full Project Proposal (Updated)

**Project Name:** MunafaOS (Intelligent Decision Support System for F-Commerce in Bangladesh)  
**Project Type:** Final Year / Thesis Project  
**Version:** 2.0 (Full Proposal)  
**Date:** February 21, 2026  

---

## 1. Executive Summary

MunafaOS is a web-based platform built for Bangladeshi F-commerce sellers who manage daily orders through Facebook, Messenger, WhatsApp, and phone calls. The project solves three major business problems: unstructured customer and supplier messages, inaccurate real profit calculation, and weak stock visibility.

The system combines:
- Smart text parsing for Banglish (Bangla + English) input
- AI-assisted inventory extraction (single item, bulk item, and image/OCR)
- Real-time order profit analytics
- Secure cloud data storage with user-level access control

MunafaOS is implemented using React (Vite), Firebase Authentication, Cloud Firestore, and Gemini AI. The product is already functional and deployable, and this proposal presents the complete project in proper academic and technical order.

---

## 2. Background and Problem Statement

### 2.1 Industry Context
Small and medium F-commerce businesses in Bangladesh often operate without structured ERP systems. Most order and stock records are handled manually in notebooks or spreadsheets.

### 2.2 Core Problems
1. **Manual data entry overload**  
   Sellers spend significant time copying customer and supplier messages into structured records.

2. **Profit blindness**  
   Many sellers calculate profit using only selling price minus product cost, ignoring delivery, ad spend, and packaging.

3. **Banglish parsing difficulty**  
   Customer text often mixes Bangla terms, English words, and inconsistent formatting.

4. **Inventory inconsistency**  
   Supplier messages may contain multiple products in one message, causing errors in item creation.

5. **Limited actionable analytics**  
   Small sellers rarely have dashboards that clearly show cost breakdown and net profit drivers.

---

## 3. Project Goal and Objectives

### 3.1 Goal
To develop a practical, secure, AI-assisted decision support system that improves order processing speed, inventory accuracy, and profit visibility for Bangladeshi F-commerce sellers.

### 3.2 Specific Objectives
- Build a smart order form that parses customer text into structured fields (name, phone, address).
- Auto-detect delivery zone context (inside/outside Dhaka indicators) to prefill delivery cost logic.
- Provide AI-assisted inventory intake from:
  - raw text,
  - bulk supplier text,
  - product/invoice images.
- Implement real-time net profit analytics and visual cost distribution.
- Add inventory management with pagination and optimized rendering.
- Ensure per-user data isolation and account-level privacy controls.

---

## 4. Scope of Work

### 4.1 In Scope
- User authentication (Google login)
- Order entry and order history
- Profit calculation and dashboard charts
- Inventory add/list/delete workflows
- AI parsing for inventory (single and bulk)
- OCR/image-to-structured data extraction
- Export order report to Excel
- Settings for erase data and delete account

### 4.2 Out of Scope (Current Version)
- Multi-user team roles (manager/staff hierarchy)
- Payment gateway integration
- Courier API auto-booking
- Native mobile app (Android/iOS)
- Full accounting ledger and tax module

---

## 5. Stakeholders and Beneficiaries

- **Primary Users:** Bangladeshi F-commerce micro and small business owners
- **Secondary Users:** Order operators, assistant sellers, digital marketing operators
- **Academic Stakeholders:** Supervisors, examiners, and institution project review boards

Expected benefits include reduced manual workload, faster inventory onboarding, and better profitability decisions.

---

## 6. Proposed System Overview

MunafaOS contains three major functional domains:

1. **Orders Domain**
   - Smart order capture from messy text
   - Profit-aware order persistence
   - Status updates (Pending, Delivered, Returned)
   - Receipt and export support

2. **Inventory Domain**
   - Manual add and AI-assisted add
   - Bulk import from supplier message
   - Category normalization and item sanitation
   - Search/filter and paginated listing

3. **Analytics & Governance Domain**
   - Profit dashboard (revenue, costs, net profit, margin)
   - Visual expense breakdown charts
   - Data erase and account deletion controls

---

## 7. Technical Architecture

### 7.1 Technology Stack
- **Frontend:** React.js (Vite), Tailwind CSS
- **Visualization:** Recharts
- **Backend Platform:** Firebase (serverless architecture)
- **Database:** Cloud Firestore
- **Authentication:** Firebase Auth (Google provider)
- **AI Service:** Gemini (Google Generative AI)
- **Reporting:** XLSX export

### 7.2 High-Level Architecture Flow

1. User authenticates with Firebase Auth.
2. Frontend modules interact with Firestore using authenticated user context.
3. AI workflows call Gemini API for extraction tasks.
4. Structured outputs are validated and saved to Firestore.
5. Real-time listeners update UI instantly for inventory and orders.

### 7.3 Security and Data Isolation
- Every critical document is tagged with `userId`.
- Query patterns consistently filter by authenticated user.
- Settings module supports controlled data deletion.
- Input sanitization is applied for user text fields in order workflows.

---

## 8. Functional Requirements

### 8.1 Authentication
- FR-01: User can login via Google account.
- FR-02: Logged-out users cannot access protected data views.

### 8.2 Orders
- FR-03: User can paste raw text and auto-extract customer details.
- FR-04: User can edit extracted fields before save.
- FR-05: System computes net profit from selling, delivery, ad, and cost components.
- FR-06: User can update order status.
- FR-07: User can export order report to Excel.

### 8.3 Inventory
- FR-08: User can add single inventory item manually.
- FR-09: AI can parse single product text into structured fields.
- FR-10: AI can parse multi-product supplier text and return array output.
- FR-11: User can save bulk items using atomic Firestore batch write.
- FR-12: User can upload image and extract product metadata.
- FR-13: Inventory list supports search, category filter, and load-more pagination.

### 8.4 Settings and Privacy
- FR-14: User can erase own order data.
- FR-15: User can delete own account with confirmation flow.

---

## 9. Non-Functional Requirements

- **Performance:** Initial inventory load optimized with `limit()` pagination and memoized rendering.
- **Reliability:** AI model fallback and model discovery to reduce hard failures.
- **Usability:** Simple form-first interface with guided actions and alerts.
- **Scalability:** Firestore server-side count and incremental fetch strategy for large datasets.
- **Maintainability:** Modular component structure across pages, components, services, and utils.

---

## 10. Key Innovation and Differentiation

1. **Banglish-Aware Data Entry Support**
   - Handles mixed-language informal order input patterns common in Bangladesh.

2. **Resilient AI Parsing Layer**
   - Includes primary model, fallback model, and model discovery strategy.

3. **Bulk Inventory Import with Atomic Persistence**
   - Supplier messages containing many products are parsed and saved in one transaction.

4. **Vision-to-Inventory Pipeline**
   - File input converted to base64 for Gemini Vision extraction, then mapped to stock form fields.

5. **Profit Autopsy and Cost Transparency**
   - Exposes hidden cost leakage (ads, delivery, packaging) for each order.

---

## 11. Methodology and Development Approach

### 11.1 Development Model
Iterative and feature-driven development was used:
- Build baseline order/inventory modules
- Add parser and analytics
- Integrate AI services (text, bulk, image)
- Apply performance optimizations and reliability hardening

### 11.2 Implementation Strategy
- Start with manual-first workflows to ensure operational continuity.
- Layer AI augmentation on top of stable manual forms.
- Validate AI output before persistence.
- Use real-time listeners for immediate UI consistency.

---

## 12. Data Model Summary

### 12.1 Orders Collection (Key Fields)
- `userId`, `name`, `phone`, `address`
- `sellingPrice`, `discountPrice`, `productCost`, `deliveryCost`, `adCost`
- `category`, `subcategory`, `sku`
- `status`, `timestamp`

### 12.2 Inventory Collection (Key Fields)
- `userId`, `name`, `buyingPrice`, `quantity`
- `category`, `subcategory`, `sku`
- `supplier`, `invoiceNumber`
- `importMethod`, `rawSourceText`
- `timestamp`

---

## 13. Current Implementation Status

### 13.1 Completed Modules
- Authentication and view switching (Inventory, Orders, Settings)
- Smart order form with parser integration
- Order history with status update and delete
- Dashboard chart visualization
- Receipt generation and Excel export
- AI single-item inventory extraction
- AI multi-item bulk extraction and batch save
- Image OCR extraction with structured mapping
- Inventory search/filter and load-more behavior
- Settings privacy actions (erase and account delete)

### 13.2 Stability Enhancements Implemented
- API key presence checks
- AI error-specific alerts
- Model fallback and model discovery
- Type and format validation for AI outputs
- Numeric sanitization and category normalization

---

## 14. Testing and Evaluation Plan

### 14.1 Functional Testing
- Authentication flow test
- Smart parser extraction test (Banglish samples)
- Order save/update/delete test
- Inventory add/list/delete test
- Bulk import parsing and save transaction test
- OCR extraction and field mapping test

### 14.2 Performance Testing
- Inventory load under increasing dataset size
- Pagination behavior at high item counts
- UI responsiveness under filter/search operations

### 14.3 Reliability Testing
- Invalid AI key scenario
- Model not found scenario
- Network failure and JSON parse failure scenarios

### 14.4 Success Metrics
- Reduced average order entry time
- Reduced inventory onboarding time for bulk supplier messages
- Improved profit calculation consistency
- Stable UX for high-volume inventory data

---

## 15. Work Plan and Timeline

| Phase | Activities | Status |
|------|------------|--------|
| Phase 1 | Problem analysis, scope definition, UI baseline | Completed |
| Phase 2 | Orders module + parser + Firestore integration | Completed |
| Phase 3 | Profit dashboard + export + receipt workflows | Completed |
| Phase 4 | Inventory module + AI single parsing | Completed |
| Phase 5 | Bulk import + batch transaction + optimization | Completed |
| Phase 6 | OCR/image extraction + reliability hardening | Completed |
| Phase 7 | Documentation, defense prep, final refinement | In Progress |

---

## 16. Risk Assessment and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI model/API changes | Parsing interruption | Fallback model + model discovery + clear error messaging |
| Invalid user input | Data quality issues | Input sanitization + numeric bounds + validation |
| Network instability | Delayed operations | User feedback states + retry-capable flows |
| Large dataset lag | Poor UX | Query limit, count aggregation, memoized rendering |
| Privacy concern | Trust loss | User-isolated data and controlled deletion options |

---

## 17. Expected Outcomes

- A practical production-ready web solution for small sellers.
- Faster transition from unstructured text to structured business records.
- Better decision-making through true net profit visibility.
- A reusable technical foundation for future expansion (courier integration, mobile client, multi-user roles).

---

## 18. Future Enhancement Roadmap

- Role-based access control (owner, operator, analyst)
- Courier service API integration
- Bengali-first UI localization and voice input
- Predictive demand and stock-out forecasting
- Multi-channel order ingestion (Facebook/WhatsApp webhook adapters)

---

## 19. Conclusion

MunafaOS directly addresses a real operational pain point in Bangladesh’s F-commerce ecosystem by combining practical UX, AI-assisted extraction, and transparent profit analytics. The current implementation demonstrates both technical depth and business relevance. With ongoing refinement and deployment hardening, the system is positioned to evolve into a robust micro-ERP for local digital commerce entrepreneurs.

---

## 20. Appendix: Technical Evidence Snapshot

This proposal is supported by implemented code modules in:
- `src/services/aiService.js` (single, bulk, vision extraction + fallback strategy)
- `src/components/AddInventory.jsx` (bulk parse and atomic save pipeline)
- `src/components/InventoryList.jsx` (pagination, count aggregation, memoized rows)
- `src/components/SmartForm.jsx` and `src/utils/parser.js` (order parsing + sanitization)
- `src/components/OrderList.jsx` and `src/components/Dashboard.jsx` (profit analytics and export)
- `src/components/Settings.jsx` (privacy and account actions)

Prepared for final project documentation and defense presentation.
