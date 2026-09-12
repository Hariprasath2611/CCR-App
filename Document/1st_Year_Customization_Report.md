# COURSE COVERAGE REPORT (CCR) SYSTEM
## 1st Year Department (Science & Humanities) Customization Report

---

## 1. Executive Summary & Brief Overview
This document details the technical coding architecture and operational data entry customizations implemented for the **1st Year Department (Science & Humanities / S&H)** at Jaya Engineering College within the Course Coverage Report (CCR) System.

* **Multi-Section Scope:** The 1st Year Department encompasses 7 parallel sections (`SEC-A` through `SEC-G`) spanning multiple engineering branches including CSE, CCE, IT, AIML, CSBS, Aero, Mech, Robo, ECE, and EEE.
* **Shared Faculty Resources:** S&H faculty members (Mathematics, Physics, Chemistry, English, Humanities) teach across multiple sections, requiring multi-section role access.
* **Standardized Core Curriculum:** Built on Anna University Semester I core curriculum (`MA25C01` Applied Calculus, `PH25C01` Applied Physics, `CY25C01` Applied Chemistry, `CS25C01` Computer Programming in C, `CS25C03` Essentials of Computing).
* **Rapid Data Entry:** Subject teachers can record weekly class progress in under 2 minutes, with automatic aggregation for Class Counselors and HOD approval.

---

## 2. Coding & Technical Architecture Customizations

### A. Section Templates Registry (`sectionTemplates.ts`)
The frontend application implements a centralized configuration registry mapping section codes (`SEC-A` to `SEC-G`) to specific academic years, semesters, departments, and pre-loaded subject catalogs:
* **`SEC-A`**: Computer Science & Engineering (CSE) — 9 Subjects (`MA25C01`, `ENG25C01`, `UC25H01`, `PH25C01`, `CY25C01`, `CS25C01`, `CS25C03`, `ME25C16`, `UC25A01`)
* **`SEC-B`**: Computer Science & Communication Engineering (CSE & CCE)
* **`SEC-C`**: Information Technology (IT)
* **`SEC-D`**: Artificial Intelligence & Machine Learning / CSBS (AIML/CSBS)
* **`SEC-E`**: Aeronautical, Mechanical & Robotics Engineering (Aero/Mech/Robo)
* **`SEC-F` & `SEC-G`**: Electronics & Communication / Electrical Engineering (ECE/EEE)

### B. Shared Faculty Mapping & Database Seeding (`connection.ts`)
In the SQLite/MongoDB schema layer, 1st-year timetable records (slots `t100` through `t134`) link shared professors to multiple sections. When a single professor logs into the mobile app, the system dynamically queries and displays distinct subject cards for every section they teach.

### C. PDF & Word Document Formatting Engines (`reportPdfTemplate.ts` & `reportWordTemplate.ts`)
Automated report engines format 1st-year progress reports according to JEC academic compliance standards:
* Filters non-academic rows (e.g. Life Skills, Physical Education) while retaining metrics for core theory and lab subjects.
* Computes planned periods, handled periods, cumulative coverage percentages, and deviation reasons.
* Generates high-resolution PDF/Word downloads with official college headers and signature blocks.

### D. Offline Sync & Cache Engine
React Native local SQLite cache allows faculty to input class logs in low-connectivity zones (e.g., ground-floor physics/chemistry labs). The offline queue automatically syncs data to the central REST server upon network reconnection.

---

## 3. Data Entry & Operational Workflows

### A. 2-Minute Faculty Progress Logging
Subject teachers follow a streamlined 4-step mobile/web logging workflow:
1. **Select Assigned Section Card** from dashboard (e.g., `1st Year SEC-A`).
2. **Input Period Metrics:** Enter numbers for Planned Periods, Handled Periods, and Required Periods.
3. **Check Completed Topics:** Tick off completed syllabus topics from pre-loaded topic checklists (eliminates manual typing).
4. **Log Delay Reasons:** Select or type reasons if coverage is behind schedule (e.g. holiday, lab exam).

### B. Master Batch Data Ingestion
To eliminate manual setup errors, 1st-year data is pre-ingested from institutional master files:
* `1st_Year_Faculty_Details.xlsx`: Maps teacher names, emails (`@jec.com`), and assigned sections.
* `1st_Year_Faculty_Credentials.xlsx`: Provisions secure account credentials for seamless onboarding.

### C. Class Counselor & HOD Approval
* **Class Counselors** view a unified dashboard showing all 9 subjects assigned to their section, append weekly summary remarks, and submit to the HOD in 1 click.
* The **1st Year HOD** reviews section submissions on a consolidated screen and approves reports with one-tap digital verification.

---

## 4. Customization Comparison Matrix

| Feature Area | Coding Customization (Technical) | Data Entry Customization (Operational) |
| :--- | :--- | :--- |
| **Section Configuration** | Dynamic section mapping registry (`SEC-A` to `SEC-G`) in [`sectionTemplates.ts`](file:///d:/work/cc-app/frontend/src/config/sectionTemplates.ts) | Pre-filtered 1st-year section cards per faculty dashboard |
| **Faculty Allocation** | Multi-section query logic supporting shared S&H professors | Seamless switching between `SEC-A`, `SEC-B`, etc., in 1 tap |
| **Syllabus Data** | Database schema pre-loaded with Anna University 1st-year subject codes | Pre-checked topic selection (no manual typing required) |
| **Offline Connectivity** | SQLite local caching with auto-sync REST API endpoints | Offline draft saving for low-signal classrooms and laboratories |
| **Report Generation** | Custom PDF/Word template rendering engines | 1-click export of official weekly CCR documents for HOD/Principal |

---

## 5. Technical References
* [`1st_Year_Customization_Report.docx`](file:///d:/work/cc-app/Document/1st_Year_Customization_Report.docx)
* [`CCR_1st_Year_Implementation_Guide.docx`](file:///d:/work/cc-app/CCR_1st_Year_Implementation_Guide.docx)
* [`sectionTemplates.ts`](file:///d:/work/cc-app/frontend/src/config/sectionTemplates.ts)
* [`reportPdfTemplate.ts`](file:///d:/work/cc-app/frontend/src/services/api/reportPdfTemplate.ts)
* [`reportWordTemplate.ts`](file:///d:/work/cc-app/frontend/src/services/api/reportWordTemplate.ts)
