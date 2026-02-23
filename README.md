# MunafaOS 📊
**The Intelligent Decision Support System for F-Commerce in Bangladesh**

MunafaOS (formerly Profit Optimizer) is a web application built to help Bangladeshi F-commerce teams automate order operations, calculate real net profit, and manage workspace-shared inventory and users securely.

## 🚀 Live Demo
- **Production App:** https://profit-optimizer-v1.web.app
- **GitHub Repository:** https://github.com/STORM-36/MunafaOS

---

## ✅ Current Project Status (Updated)
This project now includes:

### 1) RBAC + Workspace Foundation
- Global `AuthContext` with:
  - `currentUser`
  - `userRole`
  - `workspaceId`
  - `loading`
- Firestore profile provisioning (`users/{uid}`) integrated with auth flows.
- Legacy profile auto-bootstrap in auth listener.
- Revoked-user enforcement:
  - If profile role is `revoked`, user is instantly signed out.

### 2) Real Route-Based Access Control
- Full route architecture with `react-router-dom`.
- Public route:
  - `/login`
- Protected staff routes (`owner`, `operator`):
  - `/dashboard`
  - `/orders`
- Owner-only routes:
  - `/team`
  - `/settings`
- Additional routes:
  - `/unauthorized` (with emergency sign-out)
  - Catch-all redirect handling.

### 3) Team Management (Owner-Only)
- Owner can create operator accounts using **secondary Firebase auth app** (`SecondaryApp`) without logging out main session.
- Employee profile creation in `users` collection with workspace binding.
- Employee list scoped by workspace.
- Revoke access now uses secure soft-disable (not hard delete):
  - `role: 'revoked'`
  - `status: 'disabled'`
- System Audit Trail viewer:
  - Reads from `audit_logs`
  - Ordered by newest timestamp.

### 4) Workspace-Safe Data Model Integration
- Orders and inventory writes now include `workspaceId`.
- Orders and inventory reads now query by `workspaceId`.
- Note: old records created before workspace migration may need one-time backfill for `workspaceId`.

### 5) UI Permission Hardening
- Sensitive actions restricted to owner role:
  - Inventory delete controls
  - Order delete controls
  - Settings destructive actions (erase/delete)
- Operator UI no longer exposes owner-only settings navigation.

### 6) Firestore Security Rules (RBAC-Aware)
- Rules now support:
  - `getUserData()`
  - `isWorkspaceMember(workspaceId)`
  - `isOwner()`
- Collection-level RBAC rules for:
  - `users`
  - `inventory`
  - `orders`
  - `audit_logs`
- Catch-all deny remains in place for unhandled paths.

---

## 💡 Problem MunafaOS Solves
Small online sellers and teams struggle with:
- Manual message-to-sheet data entry
- Hidden cost leakage (delivery, ads, packaging)
- Mixed Bangla/English input chaos
- No secure team-based workspace controls

MunafaOS bridges messy inputs and structured, secure, decision-ready data.

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Recharts
- **Backend:** Firebase (Firestore, Auth, Hosting)
- **Auth:** Firebase Auth (Email + Google)
- **Database:** Cloud Firestore
- **Export/Utilities:** XLSX and app-specific parsers

---

## 👥 Authors & Contributors
- **Creator & Lead Developer:** Mong Shainu Marma
- **Co-Author, Design, Logistics & Contributor:** Munjur E Fatima Khan Monisha

---

## 📌 Deployment Notes
- Hosting, Firestore rules, and indexes are actively deployed on Firebase project `profit-optimizer-v1`.
- For local run:
  - `npm install`
  - `npm run dev`
- For production build:
  - `npm run build`

---

## © Copyright
**MunafaOS 2026**. All Rights Reserved.
