# 🛠️ Course Coverage Report (CCR) - Tech Stack Documentation

This document provides a comprehensive component breakdown, library versions, and architectural roles of all technologies used in the **Course Coverage Report (CCR) Management System**.

---

## 📱 1. Frontend Architecture (Mobile & Web Client)

The mobile and web client application is built with **React Native** and **Expo**, enabling cross-platform deployment across Android, iOS, and Web.

| Technology / Library | Version | Category | Primary Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Expo Framework** | `~57.0.7` | Client Framework | Managed mobile application runtime, native module integration, and build tooling |
| **React Native** | `0.86.0` | UI Foundation | Native cross-platform rendering engine |
| **TypeScript** | `~6.0.3` | Language | Static typing, interface definitions, and compile-time error checking |
| **React Native Paper** | `^5.15.3` | UI Component System | Material Design component library for forms, cards, dialogs, and themes |
| **Zustand** | `^5.0.14` | State Management | Lightweight, unopinionated client state management store |
| **Expo SQLite** | `~57.0.1` | Local Storage | On-device persistent SQLite database for offline-first caching |
| **NetInfo** | `^12.0.1` | Connectivity | Monitoring active device network status (`@react-native-community/netinfo`) |
| **React Hook Form** | `^7.81.0` | Form Management | Form state handling, input binding, and submission lifecycle |
| **Zod** | `^4.4.3` | Validation | Form schema definition and runtime validation |
| **React Navigation** | `^7.x` | Routing | Native stack (`@react-navigation/native-stack`) & bottom tab navigators (`@react-navigation/bottom-tabs`) |
| **Axios** | `^1.18.1` | Networking | HTTP REST API client with interceptors for JWT token attachment |
| **Expo Print & Sharing**| `~57.0.1` | Document Export | Generating and sharing PDF reports directly on device |
| **docx** | `^9.7.1` | Document Export | Native Word document (.docx) generation |
| **Async Storage** | `2.2.0` | Storage | Key-value persistent storage for user tokens and session flags |

---

## ⚙️ 2. Backend Architecture (REST API Infrastructure)

The backend is built as a RESTful API service running on Node.js with Express and TypeScript.

| Technology / Library | Version | Category | Primary Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>=20.12.0` | Runtime Environment | Event-driven asynchronous JavaScript runtime |
| **Express.js** | `^4.19.2` | Web Framework | REST API route handling, middleware pipelines, and controller management |
| **TypeScript** | `^5.4.5` | Language | Server-side static typing and controller request/response contracts |
| **Prisma ORM** | `^5.12.1` | Database ORM | Type-safe MongoDB query builder, schema generator, and database manager |
| **MongoDB** | Cloud Cluster | Database Persistence | Primary cloud NoSQL document database |
| **jsonwebtoken** | `^9.0.2` | Auth Security | Issue and verify JSON Web Tokens (JWT) for session management |
| **bcryptjs** | `^2.4.3` | Auth Security | One-way password hashing and secure hash verification |
| **Helmet** | `^8.3.0` | HTTP Hardening | Express middleware securing HTTP headers |
| **Express Rate Limit** | `^8.6.0` | Rate Limiting | Protect against brute-force attacks and API abuse |
| **CORS** | `^2.8.5` | Security Policy | Cross-Origin Resource Sharing control |
| **Zod** | `^4.4.3` | Data Validation | Backend request body validation schemas |
| **ts-node-dev** | `^2.0.0` | Dev Tooling | Fast TypeScript execution with auto-restart on code edits |

---

## 💾 3. Database & Storage Layer Architecture

### Primary Database: MongoDB Cloud
* **ORM:** Prisma ORM (`@prisma/client`)
* **Data Models:**
  * `User`: Staff, Class Coordinators, HODs, Principal accounts & department mappings.
  * `TimetableSlot`: Faculty weekly contact schedules and room assignments.
  * `SyllabusNode`: Course syllabus structure, unit divisions, and granular topic IDs.
  * `WeeklyPlan`: Target topic coverage planned by subject teachers.
  * `ProgressLog`: Logged contact periods, covered topics, and pending topics.
  * `ExtraHourRequest`: Requests for additional contact periods.
  * `ConsolidatedReport`: Weekly aggregated class report with CC and HOD approvals.

### Local Client Database: SQLite
* **Driver:** `expo-sqlite`
* **Role:** Staging database for offline log submission when mobile device lacks internet connection.
* **Sync Strategy:** Staged records marked `PENDING_SYNC` auto-post to backend when `NetInfo` confirms connection.

---

## 🔒 4. Security & Access Control

* **Domain Email Firewall:** Access strictly restricted to verified `@jec.com` email domains.
* **Role-Based Portals (RBAC):**
  * `STAFF` - Log progress & submit weekly plans.
  * `Class Coordinator` - Consolidate class progress & add coordinator remarks.
  * `HOD` - Approve or return department progress reports.
  * `ADMIN` (Principal) - Institution-wide analytics and audit trail monitoring.
* **JWT Bearer Authentication:** Secure stateless token verification on protected API endpoints.
