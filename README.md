![Banner](frontend/src/assets/Banner.png)

# Course Coverage Report (CCR) Management System

An automated, offline-first mobile and web platform built for **Jaya Engineering College** to track, coordinate, and approve academic course coverage and syllabus progress in real-time.

---

## 📌 Project Overview
The **CCR Management System** replaces manual progress logging, Excel tracking, and paper reports. It provides a secure, digital pipeline for Subject Teachers, Class Coordinators, HODs, and the Principal to submit, review, and approve weekly course progress logs.

---

## 🛠️ Key Features
* **Automated Consolidations:** Generates weekly course spreadsheets automatically, listing topics covered, class contact hours, and coverage completion status.
* **Offline-First Synchronizer:** Faculty can log syllabus details in areas of poor internet connectivity; SQLite local storage handles the caching, auto-syncing with MongoDB once network access is restored.
* **Domain Security Firewall:** Restricts access strictly to verified institutional emails (`@jec.com`).
* **Role-Based Portals:** Custom user dashboards for Subject Teachers, Class Coordinators (Counselors), HODs, and the College Principal.
* **Document Exporting:** Instantly exports weekly coverage summaries as PDF reports.

---

## ⚙️ Tech Stack & Infrastructure

### Frontend (Mobile App)
* **Framework:** React Native / Expo
* **Language:** TypeScript
* **State Management:** Zustand
* **Local Database (Offline Cache):** SQLite
* **UI Components:** React Native Paper & Vector Icons

### Backend (REST API)
* **Runtime:** Node.js / Express
* **Language:** TypeScript
* **Database ORM:** Prisma ORM
* **Cloud Database:** MongoDB
* **Authentication:** JSON Web Tokens (JWT)

---

## 📂 Repository Structure
```bash
├── backend/                  # REST API Server
│   ├── src/                  # Controller, route, and database service definitions
│   ├── prisma/               # Prisma database schemas (MongoDB mappings)
│   ├── package.json          # Dependencies
│   └── tsconfig.json         # TypeScript rules
│
├── frontend/                 # React Native / Expo Application
│   ├── src/                  # Component logic, screens, and custom state hooks
│   │   ├── assets/           # Media files & logos
│   │   └── features/         # Features split by domain (auth, cc, hod, principal)
│   ├── package.json          # Native app dependencies
│   └── App.tsx               # App entry-point
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Install [Node.js](https://nodejs.org/) (v18 or higher recommended)
* Install [Expo CLI](https://docs.expo.dev/more/expo-cli/) for native development testing

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environments in a `.env` file (e.g., set up your `DATABASE_URL` for MongoDB).
4. Synchronize your Prisma client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Spin up the server in development mode:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Boot up the Expo development server:
   ```bash
   npx expo start
   ```

---

## 🔒 Security & Distribution
This application utilizes secure private delivery methods to protect institutional workflows:
* **Managed Google Play (Private Release):** Visible only to accounts logged in under the college's Google Workspace domain (`@jec.com`).
* **Apple School Manager:** Customized distribution via school-managed portals.
* **Self-Hosted Portal:** Restricts software installers to users authenticated through campus-wide network access.

---

## 📡 API Versioning & Backward Compatibility Rules

> [!IMPORTANT]
> **BACKWARD COMPATIBILITY CONTRACT:**
> 1. Existing client releases communicate with `/v1/*` and canonical `/api/v1/*`.
> 2. **Never remove or rename response fields** consumed by previously released client versions.
> 3. Only **add** new nullable or optional fields.
> 4. For complete release procedures, APK signing configs, and zero-downtime remote control, refer to [RELEASE.md](file:///d:/work/cc-app/RELEASE.md).
