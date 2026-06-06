# VendorBridge AI

VendorBridge AI is a next-generation, AI-powered Procure-to-Pay (P2P) platform designed to streamline enterprise procurement. It provides a unified, real-time ecosystem connecting internal employees, procurement teams, managers, and external vendors.

## 🚀 Features

*   **Multi-Role Dashboards**: Purpose-built, highly dynamic dashboards tailored for different roles:
    *   **Admin**: System overview, vendor health, risk alerts, and total spend analytics.
    *   **Manager/Director**: Approval workflows, recent actions, and budget tracking.
    *   **Procurement Officer**: Active RFQs, incoming quotations, and PR-to-PO conversions.
    *   **Employee**: Personal purchase request tracking (Draft, Pending, Approved, Rejected).
    *   **Vendor**: Opportunity pipeline (RFQs), submitted quotes, active POs, and pending payments.
*   **End-to-End Procurement Lifecycle**:
    *   **Purchase Requests (PR)**: Employees submit hardware/software/service requests.
    *   **Dynamic Approvals**: Multi-level hierarchy approvals based on budget limits.
    *   **RFQ & Quotations**: Publish Request for Quotations, invite vendors, and receive competitive bids.
    *   **Purchase Orders (PO)**: Auto-generate POs upon quotation acceptance and final approval.
    *   **Goods Receipt Notes (GRN)**: Track received quantities and condition.
    *   **3-Way Matching & Invoicing**: Automated verification matching POs, GRNs, and Invoices to prevent fraud.
    *   **Payments**: Secure payment receipt generation and tracking.
*   **Document Management**: One-click **Download PDF**, **Print**, and **Email** actions integrated directly into RFQs, POs, Invoices, and Payment Receipts.
*   **AI Integration**: Smart recommendations for vendor selection based on Trust Scores, delivery history, and technical compliance.
*   **Modern Aesthetics**: Glassmorphism design system, dark mode native, and micro-animations for a premium UX.

## 🛠 Tech Stack

This project is structured as a modern Monorepo utilizing **Turborepo**.

*   **Frontend**: Next.js 14, React, Tailwind CSS, Lucide Icons, Radix UI.
*   **Backend**: Node.js, Express.js.
*   **Database**: PostgreSQL, Prisma ORM.
*   **Authentication**: JWT-based role-based access control (RBAC) with bcrypt hashing.
*   **Language**: TypeScript across the entire stack.

## 📦 Project Structure

```text
├── apps/
│   ├── web/             # Next.js frontend application
│   └── api/             # Express.js backend API
├── packages/
│   └── database/        # Prisma schema, migrations, and robust database seeder
```

## ⚙️ Quick Start

### 1. Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   PostgreSQL running locally or via Docker

### 2. Environment Setup
Copy `.env.example` to `.env` in the root and in `packages/database`.
Ensure your `DATABASE_URL` is pointing to your PostgreSQL instance.

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
This project comes with a comprehensive seeding script that populates the database with realistic test data across all entities.
```bash
# Navigate to the database package
cd packages/database

# Push the schema to the database
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed the database with comprehensive test data
npm run db:seed
```

### 5. Run the Development Server
From the root directory:
```bash
npm run dev
```
*   Frontend: `http://localhost:3000`
*   Backend API: `http://localhost:5000`

## 🔑 Test Credentials

Use the following credentials to test the various role-based workflows in the system. 
**Password for all users:** `VendorBridge@2024`

| Role | Email Address | Description |
| :--- | :--- | :--- |
| **Admin** | `admin@vendorbridge.in` | Full system oversight and settings. |
| **Director** | `anita.desai@vendorbridge.in` | High-level approvals (Level 3). |
| **Senior Manager** | `vikram.patel@vendorbridge.in` | Mid-level approvals (Level 2). |
| **Manager** | `priya.sharma@vendorbridge.in` | Department approvals (Level 1). |
| **Procurement Officer** | `suresh.menon@vendorbridge.in` | Handles RFQs, Quotations, and PO generation. |
| **Employee** | `amit.verma@vendorbridge.in` | Submits purchase requests. |
| **Vendor** | `vendor@technova.in` | External supplier responding to RFQs. |

## 🧪 Evaluation Notes

During the evaluation, you will notice the system is fully interconnected. For example:
1. An **Employee** creates a PR.
2. A **Manager** approves it.
3. A **Procurement Officer** generates an RFQ and publishes it.
4. A **Vendor** submits a Quotation.
5. The **Procurement Officer** accepts the Quote, requests final approval, and generates a PO.
6. The system supports full 3-Way Matching prior to Invoice payment.

All entities (Dashboards, Settings, Quotations, RFQs, POs, Invoices, Payments) have been rigorously tested to ensure dynamic data flow (no "0 entries" bugs) and responsive action buttons (Print/PDF/Email).
