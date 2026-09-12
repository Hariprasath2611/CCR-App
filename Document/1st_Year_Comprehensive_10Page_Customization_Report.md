# JAYA ENGINEERING COLLEGE
## DEPARTMENT OF SCIENCE & HUMANITIES (S&H)
### Course Coverage Report (CCR) System — Comprehensive 10-Page Customization Specification & Technical Manual

---

> [!NOTE]
> **Document Purpose**: This comprehensive specification document provides an exhaustive technical and operational analysis of the 1st Year Department (Science & Humanities) customizations within the Course Coverage Report (CCR) Management System at Jaya Engineering College (JEC). It covers software architecture, database design, REST API specifications, section template configurations (`SEC-A` through `SEC-G`), automated document generation (PDF/Word), offline caching engines, master data entry pipelines, and complete faculty-subject matrices.

---

## 1. Institutional Context & Problem Formulation

### 1.1 Background of the 1st Year Engineering Department
The 1st Year Department (Science & Humanities) at Jaya Engineering College serves as the foundational academic baseline for all incoming undergraduate engineering students. Unlike upper-level academic departments (CSE, ECE, EEE, Mechanical, Civil) which operate within isolated departmental boundaries, the 1st Year Department governs all first-year students across 10 specialized degree programs:
1. **CSE**: Computer Science & Engineering
2. **CCE**: Computer Science & Communication Engineering
3. **IT**: Information Technology
4. **AIML**: Artificial Intelligence & Machine Learning
5. **CSBS**: Computer Science & Business Systems
6. **Aero**: Aeronautical Engineering
7. **Mech**: Mechanical Engineering
8. **Robo**: Robotics & Automation
9. **ECE**: Electronics & Communication Engineering
10. **EEE**: Electrical & Electronics Engineering

### 1.2 Legacy Academic Progress Tracking Challenges
Prior to the rollout of the digitized Course Coverage Report (CCR) Management System, tracking syllabus progress for the 1st Year Department suffered from profound administrative bottlenecks:
* **Fragmented Paper Registers:** Class coordinators physically collected paper weekly registers from up to 45 individual faculty members, manually calculating completed hours versus Anna University target hours.
* **Cross-Departmental Faculty Matrix:** Because S&H professors (Mathematics, Physics, Chemistry, English) teach across multiple engineering branches, compiling section-wise reports required cross-referencing dozens of disconnected Excel workbooks.
* **Lack of Real-Time Visibility:** The Head of Department (HOD) and the Principal lacked real-time dashboard metrics, making it impossible to detect syllabus lag prior to internal assessment examinations.
* **Inconsistent Topic Data:** Paper logs frequently lacked details regarding specific sub-topics completed, leading to discrepancies during official NBA and NAAC academic compliance audits.

### 1.3 Objectives of the 1st Year CCR Customization Project
The customized CCR system addresses these challenges through a unified mobile and web platform tailored specifically to the structural dynamics of the 1st Year S&H Department:
* **Automated Section Partitioning:** Partition 1st-year students into 7 distinct administrative sections (`SEC-A` through `SEC-G`) with pre-configured subject loads.
* **Unified Multi-Section Dashboard:** Enable shared S&H professors to log progress for multiple sections from a single dashboard without changing user accounts.
* **Pre-Loaded Syllabus Checklists:** Provide subject teachers with interactive checkable topic lists mapped to the Anna University 2026-2027 curriculum.
* **Rapid Mobile Logging:** Allow teachers to submit weekly logs in under 2 minutes, even when offline in campus laboratories.
* **One-Click Compliance Reporting:** Generate official college-formatted PDF and Word summary reports automatically for HOD and Principal review.

---

## 2. Technical Coding Architecture & Framework Design

### 2.1 High-Level System Architecture
The CCR Management System utilizes a modern, resilient multi-tier architecture optimized for high performance, offline durability, and institutional privacy:

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                            |
|  React Native (TypeScript) Mobile App & React Web Dashboard           |
|  - Staff Logging Screens   - Counselor Summary  - HOD / Principal Dash |
+-----------------------------------.-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                          OFFLINE CACHE LAYER                          |
|  SQLite Database on Mobile Client (Local Queue & Master Lookup)        |
+-----------------------------------.-----------------------------------+
                                    | REST API (JWT / SSL)
                                    v
+-----------------------------------------------------------------------+
|                          APPLICATION BACKEND                          |
|  Node.js / Express REST API Gateway (Prisma Client Schema Mapping)    |
+-----------------------------------.-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                           PERSISTENCE LAYER                           |
|  MongoDB Cloud Cluster (Primary Institutional Academic Database)       |
+-----------------------------------------------------------------------+
```

### 2.2 Centralized Section Template Engine (`sectionTemplates.ts`)
At the core of the 1st-year coding customization is the section template registry located in [`sectionTemplates.ts`](file:///d:/work/cc-app/frontend/src/config/sectionTemplates.ts). This module serves as the single source of truth for section metadata, department groupings, academic term identifiers, and pre-allocated subject templates:

```typescript
export interface TemplateSubjectItem {
  sNo: number;
  subjectCode: string;
  subjectName: string;
  staffInCharge: string;
  periodsPlannedDefault?: number;
}

export interface SectionTemplateConfig {
  section: string;
  department: string;
  academicYear: string;
  semester: string;
  subjects: TemplateSubjectItem[];
}

export const SECTION_TEMPLATES: Record<string, SectionTemplateConfig> = {
  'SEC-A': {
    section: 'A',
    department: 'CSE',
    academicYear: '2026-2027 ODD SEMESTER',
    semester: 'I',
    subjects: [
      { sNo: 1, subjectCode: 'MA25C01', subjectName: 'Applied Calculus', staffInCharge: 'Dr. KARUPPAIYA', periodsPlannedDefault: 6 },
      { sNo: 2, subjectCode: 'ENG25C01', subjectName: 'English Essential', staffInCharge: 'Mrs. Gopikha', periodsPlannedDefault: 3 },
      { sNo: 3, subjectCode: 'UC25H01', subjectName: 'Heritage of Tamil', staffInCharge: 'Dr. JOSPHIN', periodsPlannedDefault: 2 },
      { sNo: 4, subjectCode: 'PH25C01', subjectName: 'Applied Physics - 1', staffInCharge: 'Dr. SARAVANAN', periodsPlannedDefault: 6 },
      { sNo: 5, subjectCode: 'CY25C01', subjectName: 'Applied Chemistry - 1', staffInCharge: 'Dr. Bhuvaneshwari', periodsPlannedDefault: 6 },
      { sNo: 6, subjectCode: 'CS25C01', subjectName: 'Computer Programming in C', staffInCharge: 'Mrs. Agnus', periodsPlannedDefault: 6 },
      { sNo: 7, subjectCode: 'CS25C03', subjectName: 'ESSENTIALS OF COMPUTING', staffInCharge: 'Mrs. Archana', periodsPlannedDefault: 5 },
      { sNo: 8, subjectCode: 'ME25C16/EE25C16', subjectName: 'MAKERSPACE', staffInCharge: 'Mr. D.SIVAKUMAR', periodsPlannedDefault: 3 },
      { sNo: 9, subjectCode: 'UC25A01', subjectName: 'LIFE SKILLS FOR ENGINEERS-I', staffInCharge: 'Mr. D.SIVAKUMAR & Mrs. BHAKYALAKSHMI', periodsPlannedDefault: 2 },
    ],
  },
  // ... Additional configuration for SEC-B through SEC-G
};
```

### 2.3 Section Template Parsing & Utility Functions
To handle non-standard section strings and provide seamless UI fallbacks across the application, [`sectionTemplates.ts`](file:///d:/work/cc-app/frontend/src/config/sectionTemplates.ts) provides specialized helper functions:
* **`getSectionTemplate(classId)`**: Normalizes raw user input or database strings (e.g., `'1st Year SEC-A'`, `'SEC A'`, `'Section-A'`) into a standard key format.
* **`filterNonAcademicSubjects(subjects)`**: Strips non-examinable workshop/extracurricular activities (e.g., Life Skills, Physical Education) prior to compiling final academic coverage percentages.

---

## 3. Database Schema & Data Modeling

### 3.1 MongoDB Data Model (Primary Backend Store)
The MongoDB production database enforces strict data structures mapped via Prisma ORM to represent 1st-year subjects, sections, faculty credentials, and progress logs:

```prisma
// Prisma / MongoDB Conceptual Schema Representation

model SectionMaster {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  sectionCode   String   @unique // e.g. "1st Year SEC-A"
  department    String   // e.g. "CSE"
  academicYear  String   // "2026-2027 ODD"
  counselorId   String   @db.ObjectId
  subjects      SectionSubject[]
}

model SectionSubject {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  subjectCode   String   // e.g. "MA25C01"
  subjectName   String   // "Applied Calculus"
  facultyId     String   @db.ObjectId
  facultyName   String
  periodsPlanned Int     @default(6)
  syllabusTopics SyllabusTopic[]
}

model WeeklyProgressLog {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  sectionCode    String
  subjectCode    String
  facultyId      String   @db.ObjectId
  weekNumber     Int
  fromDate       DateTime
  toDate         DateTime
  periodsPlanned Int
  periodsHandled Int
  periodsRequired Int    @default(0)
  topicsCovered  String[] // Selected topic titles
  delayReason    String?
  status         String   // "SUBMITTED", "APPROVED", "REJECTED"
  createdAt      DateTime @default(now())
}
```

### 3.2 SQLite Local Client Database ([`connection.ts`](file:///d:/work/cc-app/frontend/src/database/connection.ts))
On mobile client devices, a lightweight SQLite database initialized in [`connection.ts`](file:///d:/work/cc-app/frontend/src/database/connection.ts) enables local offline querying and log queueing. The local schema includes pre-seeded timetable slots (`t100` through `t134`) specifically configured for 1st-year classrooms:

```typescript
// SQLite Timetable Slot Seeding (connection.ts)
{ id: 't100', day_of_week: 'Monday', period: 1, subject_code: 'MA25C01', subject_name: 'APPLIED CALCULUS', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Karuppaiya' },
{ id: 't101', day_of_week: 'Monday', period: 2, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mrs. Gopikha' },
{ id: 't103', day_of_week: 'Monday', period: 4, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Saravanan' },
{ id: 't104', day_of_week: 'Monday', period: 5, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Bhuvaneshwari' },
{ id: 't105', day_of_week: 'Monday', period: 6, subject_code: 'CS25C01', subject_name: 'COMPUTER PROGRAMMING:C', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mrs. Agnus' }
```

---

## 4. Data Entry & Operational Workflows

### 4.1 Role 1: Subject Teacher (2-Minute Mobile Workflow)
To ensure maximum adoption among faculty members, the progress entry workflow was engineered for rapid completion on mobile devices (Android/iOS):
1. **Step 1: Dashboard Section Selection —** Upon login, the app inspects the teacher's faculty ID and presents distinct cards for every assigned section (e.g. `'1st Year SEC-A - Applied Physics'`, `'1st Year SEC-C - Applied Physics'`).
2. **Step 2: Period Metrics Entry —** The teacher inputs three primary numerical values for the week: Planned Periods (default pre-filled), Handled Periods (actual hours taken in class), and Required Periods (extra hours needed if syllabus is lagging).
3. **Step 3: Interactive Topic Selection —** The app displays pre-loaded syllabus topics for the unit being taught. The teacher checks off completed sub-topics (e.g. `[X] Matrices & Eigenvalues`, `[X] Cayley-Hamilton Theorem`).
4. **Step 4: Delay Reasoning —** If completed hours fall below planned hours, the teacher selects or types a reason for delay (e.g., `'Industrial Visit'`, `'College Sports Day'`, `'Mid-Term Revision'`).
5. **Step 5: One-Tap Submission —** Tap **Submit Weekly Log**. If online, the payload posts to the REST server immediately. If offline, the transaction is saved to local SQLite and queued for automatic background sync.

### 4.2 Role 2: Class Counselor / Coordinator (Section Consolidation)
Each 1st-year section (`SEC-A` through `SEC-G`) is assigned a dedicated Class Counselor. The Counselor dashboard consolidates individual subject entries into a single administrative view:
* **Unified Grid View:** Displays a grid showing all 9 subjects, assigned professors, completed contact hours, cumulative coverage percentage, and pending topics.
* **Coordinator Remarks:** Appends overall weekly summary notes (e.g., *"All subject logs received. Math coverage on schedule; Physics extra hours scheduled for Saturday"*).
* **One-Click HOD Submission:** Submits the section compilation directly to the HOD queue with digital timestamping.

### 4.3 Role 3: Head of Department (HOD S&H Verification)
The 1st Year HOD evaluates section submissions across all 7 parallel streams:
* **Multi-Section Overview:** Visual progress indicators display overall coverage health for `SEC-A`, `SEC-B`, `SEC-C`, `SEC-D`, `SEC-E`, `SEC-F`, and `SEC-G`.
* **Granular Audit & Feedback:** The HOD can review detailed topic breakdowns or flag lagging subjects for academic intervention.
* **One-Tap Digital Approval:** Approving a section report automatically locks the weekly log, updates central institutional archives, and generates formatted PDF documents.

### 4.4 Role 4: Principal & Institutional Oversight
The Principal dashboard provides high-level executive analytics comparing the 1st Year S&H Department against senior departmental streams (CSE, ECE, EEE, Mechanical). The Principal can monitor compliance rates, inspect delayed subjects across the entire college, and export institutional PDF reports for governing bodies.

---

## 5. Automated Document Generation Engine (PDF & Word)

### 5.1 PDF Compilation Architecture ([`reportPdfTemplate.ts`](file:///d:/work/cc-app/frontend/src/services/api/reportPdfTemplate.ts))
The application features an automated document generation engine that compiles raw weekly database logs into publication-grade HTML templates, which are subsequently rendered into downloadable PDF files. The engine extracts metadata dynamically based on section IDs:

```typescript
// Dynamic HTML Template Generation Snippet (reportPdfTemplate.ts)
export const generateReportHTML = (report: ConsolidatedReport): string => {
  const { classId, weekNumber, subjects } = report;
  const displaySubjects = filterNonAcademicSubjects(subjects || []);
  const template = getSectionTemplate(classId);

  const tableRowsHtml = displaySubjects.map((subj, index) => {
    const plannedBullets = subj.plannedTopicsText
      ? subj.plannedTopicsText.split(/[\,\n]/).map(t => `<li>${t.trim()}</li>`).join('')
      : '<li>Standard Syllabus Topics</li>';
      
    const actualBullets = subj.topicsCoveredText
      ? subj.topicsCoveredText.split(/[\,\n]/).map(t => `<li>${t.trim()}</li>`).join('')
      : '<li>Topics covered in session</li>';

    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="font-weight: bold;">${subj.code}-${subj.name}</td>
        <td>${subj.faculty}</td>
        <td><ul>${plannedBullets}</ul></td>
        <td><ul>${actualBullets}</ul></td>
        <td style="text-align: center;">${subj.periodsPlanned}</td>
        <td style="text-align: center;">${subj.periodsHandled}</td>
        <td style="text-align: center;">${subj.coverage}%</td>
        <td>${subj.reasonsForPending || '-'}</td>
      </tr>
    `;
  }).join('');

  return `<html>... Rendered Report Table ...</html>`;
};
```

### 5.2 Word Document Generation Engine ([`reportWordTemplate.ts`](file:///d:/work/cc-app/frontend/src/services/api/reportWordTemplate.ts))
In addition to PDF generation, the system supports exporting official Word (`.docx`) documents compatible with Microsoft Office. The Word generator constructs native OpenXML table structures, applying JEC institutional branding, navy header formatting (`#0B41CD`), and explicit signature lines for the Class Counselor, HOD, and Principal.

---

## 6. Complete Section-by-Section Roster & Subject Matrix

### 6.1 Master Section-Branch Allocation Summary

| Section Code | Engineering Departments / Branches | Lecture Room | Assigned Counselor |
| :--- | :--- | :--- | :--- |
| **`SEC-A`** | Computer Science & Engineering (CSE) | `LH-10A` | Dr. KARUPPAIYA |
| **`SEC-B`** | Computer Science & Communication Engineering (CSE & CCE) | `LH-10B` | Mrs. A.VANI BERLINA |
| **`SEC-C`** | Information Technology (IT) | `LH-10C` | Mr. SRINIVASAN |
| **`SEC-D`** | Artificial Intelligence & Machine Learning / CSBS (AIML/CSBS) | `LH-10D` | Mrs. KAVITHA |
| **`SEC-E`** | Aeronautical, Mechanical & Robotics Engineering (Aero/Mech/Robo) | `LH-10E` | Dr. GOPIKUMAR |
| **`SEC-F`** | Electronics & Communication Engineering (ECE) | `LH-10F` | Mrs. JASLINE |
| **`SEC-G`** | Electrical & Electronics Engineering (EEE) | `LH-10G` | Dr. SARAVANAN |

### 6.2 Detailed Subject-Faculty Matrix for `SEC-A` (CSE)

| S.No | Subject Code | Subject Title | Staff In-Charge | Weekly Periods |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `MA25C01` | Applied Calculus | Dr. KARUPPAIYA | 6 |
| **2** | `ENG25C01` | English Essential | Mrs. Gopikha | 3 |
| **3** | `UC25H01` | Heritage of Tamil | Dr. JOSPHIN | 2 |
| **4** | `PH25C01` | Applied Physics - 1 | Dr. SARAVANAN | 6 |
| **5** | `CY25C01` | Applied Chemistry - 1 | Dr. Bhuvaneshwari | 6 |
| **6** | `CS25C01` | Computer Programming in C | Mrs. Agnus | 6 |
| **7** | `CS25C03` | Essentials of Computing | Mrs. Archana | 5 |
| **8** | `ME25C16/EE25C16` | Makerspace | Mr. D.SIVAKUMAR | 3 |
| **9** | `UC25A01` | Life Skills for Engineers-I | Mr. D.SIVAKUMAR & Mrs. BHAKYALAKSHMI | 2 |

---

## 7. Detailed Feature & Workflow Comparison Matrix

| Feature Category | Coding & Architecture Customization | Data Entry & Operational Workflow |
| :--- | :--- | :--- |
| **Section Management** | Centralized template registry in [`sectionTemplates.ts`](file:///d:/work/cc-app/frontend/src/config/sectionTemplates.ts) mapping `SEC-A` to `SEC-G`. | Automatic pre-filtering of assigned section cards upon user login. |
| **Shared Faculty Access** | Multi-tenant database query resolution supporting cross-department professors. | Teachers log progress across multiple 1st-year sections from 1 dashboard. |
| **Syllabus Data Entry** | Pre-seeded database topic tables for Anna University Semester I core subjects. | Checklist selection of topics; eliminates typing long lesson titles. |
| **Offline Operations** | SQLite mutation queue with background auto-sync REST endpoints. | Teachers enter class logs in ground-floor labs without Wi-Fi connection. |
| **Compliance Reporting** | Dynamic OpenXML (`.docx`) and HTML/PDF compilation engines. | One-click generation of formatted weekly CCR reports for HOD and Principal. |
| **Domain Security** | REST API JWT validation restricting access exclusively to `@jec.com` accounts. | Automatic account provisioning via master Excel credential imports. |

---

## 8. Security, Private Distribution & Compliance

### 8.1 Institutional Domain Validation
To protect institutional intellectual property and academic progress data, the CCR system implements rigid authentication security protocols:
* **Domain Enforcement:** User login and account registration are strictly restricted to official college email addresses ending in `@jec.com`. Requests from public domains (`gmail.com`, `yahoo.com`) are automatically rejected at the API gateway.
* **Token-Based Authentication:** All API transactions require a signed JSON Web Token (JWT) passed in the Authorization header. Tokens expire after 24 hours of inactivity.

### 8.2 Private Mobile App Distribution Strategy
To prevent competing institutions from inspecting or duplicating the internal academic workflows of Jaya Engineering College, the application bypasses public app store listings in favor of enterprise private deployment channels:
1. **Managed Google Play (Private Apps):** Distributed exclusively through Google Workspace Managed Google Play, binding app installations strictly to verified `@jec.com` Android devices.
2. **Apple Custom Apps:** Deploys private iOS installation packages via unlisted redemption codes managed through Apple Business Manager.
3. **Self-Hosted JEC Campus Portal:** Hosted on an internal campus server protected by a strict network firewall, restricting web dashboard access to local campus Wi-Fi networks.

---

## 9. System Maintenance & Roadmap

### 9.1 Routine Maintenance Protocols
* **Semester Rollover:** Update [`sectionTemplates.ts`](file:///d:/work/cc-app/frontend/src/config/sectionTemplates.ts) with Semester II subject codes (`MA25C02` Vector Calculus, `PH25C02` Physics for Electronics).
* **Database Archiving:** Archive completed 1st-year weekly logs to cold database storage to maintain high query responsiveness for incoming batches.

### 9.2 Troubleshooting Common Operational Issues
* **Issue 1: Logs Pending in Offline Queue —** Instruct faculty to connect to campus Wi-Fi briefly to allow the client SQLite queue to flush pending logs to MongoDB.
* **Issue 2: Assigned Section Card Missing —** Verify that the teacher email in [`1st_Year_Faculty_Details.xlsx`](file:///d:/work/cc-app/Document/1st_Year_Faculty_Details.xlsx) matches their registered login ID exactly.

---

## 10. Technical Document References
* 🔵 **Comprehensive Word Document (10-Page Equivalent)**: [`1st_Year_Comprehensive_10Page_Customization_Report.docx`](file:///d:/work/cc-app/Document/1st_Year_Comprehensive_10Page_Customization_Report.docx)
* 📝 **Comprehensive Markdown Document**: [`1st_Year_Comprehensive_10Page_Customization_Report.md`](file:///d:/work/cc-app/Document/1st_Year_Comprehensive_10Page_Customization_Report.md)
* 📖 **1st Year Rollout Implementation Guide**: [`CCR_1st_Year_Implementation_Guide.docx`](file:///d:/work/cc-app/CCR_1st_Year_Implementation_Guide.docx)
* ⚙️ **Section Templates Code File**: [`sectionTemplates.ts`](file:///d:/work/cc-app/frontend/src/config/sectionTemplates.ts)
* 📄 **PDF Compiler Engine Code File**: [`reportPdfTemplate.ts`](file:///d:/work/cc-app/frontend/src/services/api/reportPdfTemplate.ts)
* 📝 **Word Compiler Engine Code File**: [`reportWordTemplate.ts`](file:///d:/work/cc-app/frontend/src/services/api/reportWordTemplate.ts)
