# 📐 Course Coverage Report (CCR) System Architecture Diagrams

This document contains the system architecture diagrams, data flow models, approval pipeline workflows, and entity-relationship diagrams (ERD) for the **Course Coverage Report (CCR) Management System** at **Jaya Engineering College**.

---

## 🏛️ 1. High-Level System Architecture Diagram

The system operates on an **Offline-First Client-Server Architecture** connecting mobile Expo/React Native clients with an Express REST API backend and a cloud MongoDB database.

```mermaid
flowchart TB
    subgraph ClientLayer ["📱 Client Layer (Mobile App & Web)"]
        direction TB
        UI["React Native Paper UI"]
        Forms["React Hook Form + Zod"]
        State["Zustand Global Store"]
        SQLite[("SQLite Local Database")]
        NetInfo["NetInfo Sync Manager"]
        DocGen["PDF / DOCX Generator"]

        UI --> Forms
        Forms --> State
        State <--> SQLite
        State <--> NetInfo
        UI --> DocGen
    end

    subgraph SecurityLayer ["🛡️ Transport & Security Layer"]
        DomainFirewall["Domain Email Firewall (@jec.com)"]
        JWT["JWT Authentication Middleware"]
        Helmet["Helmet Security Headers"]
        RateLimiter["Express Rate Limiter"]

        DomainFirewall --> JWT
        JWT --> Helmet
        Helmet --> RateLimiter
    end

    subgraph BackendLayer ["⚙️ Backend API Layer (Node.js & Express)"]
        direction TB
        Controllers["Express Controllers"]
        Validators["Zod Schema Validators"]
        Services["Business Logic Services"]
        PrismaORM["Prisma Client ORM"]

        Controllers --> Validators
        Validators --> Services
        Services --> PrismaORM
    end

    subgraph DatabaseLayer ["💾 Database Layer"]
        MongoDB[("MongoDB Cloud Database")]
        PrismaORM <--> MongoDB
    end

    NetInfo <-->|HTTPS REST API / JSON| SecurityLayer
    SecurityLayer --> Controllers
```

---

## 🔄 2. Offline-First Synchronization Sequence Diagram

Logs recorded by faculty without active network connectivity are cached locally in SQLite and synchronized automatically once network connectivity is restored.

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as 👨‍🏫 Subject Teacher
    participant UI as 📱 Mobile UI (Expo / RN)
    participant LocalDB as 💾 SQLite Local Cache
    participant Sync as 🔄 NetInfo Sync Engine
    participant API as ⚙️ Express REST API
    participant DB as 🍃 MongoDB Cloud DB

    Teacher->>UI: Input weekly syllabus progress log
    UI->>LocalDB: Store record locally (Status: PENDING_SYNC)
    UI-->>Teacher: Show instant confirmation (Offline Mode)

    loop Connection Monitoring
        Sync->>Sync: Monitor network status via NetInfo
    end

    Sync->>Sync: Network connection established (Online)
    Sync->>LocalDB: Query all PENDING_SYNC records
    LocalDB-->>Sync: Return unsynced progress logs
    
    Sync->>API: POST /api/progress-logs/sync (Bearer JWT)
    API->>DB: Persist records via Prisma ORM
    DB-->>API: Write confirmation
    API-->>Sync: 200 OK (Sync Successful)

    Sync->>LocalDB: Update log status to SYNCED
    UI-->>Teacher: UI Alert: Data Synced with Server
```

---

## 👥 3. Multi-Tier Role Approval Workflow Diagram

```mermaid
graph TD
    Teacher([👨‍🏫 Subject Teacher]) -->|1. Submit Weekly Teaching Plan & Log Progress| CC([👨‍💼 Class Coordinator])
    CC -->|2. Consolidate Class Coverage & Add Remarks| HOD([👨‍💻 Head of Department])
    HOD -->|3. Review Department Reports| ApprovalCheck{Approved?}
    
    ApprovalCheck -->|Yes| Principal([🏛️ Principal / Admin])
    ApprovalCheck -->|No / Revision Needed| ReturnCC[Return to CC for Corrections]
    ReturnCC --> CC
    
    Principal -->|Final College-wide Dashboard Oversight| Archive[("Archived Consolidated Report")]
```

---

## 🗄️ 4. Database Entity-Relationship Diagram (ERD)

Target database schema defined in `backend/prisma/schema.prisma` targeting MongoDB:

```mermaid
erDiagram
    USER ||--o{ WEEKLY_PLAN : creates
    USER ||--o{ PROGRESS_LOG : submits
    USER ||--o{ EXTRA_HOUR_REQUEST : requests
    USER ||--o{ TIMETABLE_SLOT : teaches

    USER {
        string id PK
        string email UK
        string passwordHash
        string name
        string role "STAFF | HOD | ADMIN"
        boolean isClassCoordinator
        string department
        string assignedClassId
    }

    TIMETABLE_SLOT {
        string id PK
        string dayOfWeek
        int period
        string subjectCode
        string subjectName
        string classSection
        string roomNo
        string facultyId FK
    }

    SYLLABUS_NODE {
        string id PK
        string subjectCode
        string unit
        string topicId UK
        string topicTitle
    }

    WEEKLY_PLAN {
        string id PK
        int academicWeekNumber
        string subjectCode
        string targetTopicIds
        string status "DRAFT | SUBMITTED | APPROVED"
        string facultyId FK
    }

    PROGRESS_LOG {
        string id PK
        string facultyId FK
        string subjectCode
        string classId
        int academicWeekNumber
        string completedTopicIds
        string pendingTopicIds
        int periodsPlanned
        int periodsHandled
        int periodsRequired
    }

    EXTRA_HOUR_REQUEST {
        string id PK
        string facultyId FK
        string subjectCode
        string classId
        string requestedDate
        int period
        string reason
        string status "PENDING | APPROVED | REJECTED"
    }

    CONSOLIDATED_REPORT {
        string id PK
        string classId
        int weekNumber
        int overallCoverage
        string submittedBy
        string status "PENDING_CC | SUBMITTED_TO_HOD | APPROVED_BY_HOD"
        string subjectsJson
        string ccRemarks
        string hodRemarks
    }
```

---

## 🛠️ 5. Architectural Tech Stack Summary

* **Frontend:** React Native (`0.86`), Expo (`57`), TypeScript (`6.0`), Zustand (`5.0`), React Native Paper (`5.15`), SQLite, `@react-native-community/netinfo`.
* **Backend:** Node.js (`v20+`), Express (`4.19`), Prisma ORM (`5.12`), Zod (`4.4`), JWT, bcryptjs, Helmet, Express Rate Limit.
* **Database:** MongoDB (Cloud cluster).
