import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

doc = docx.Document()

# Configure Page Setup (A4 Margins)
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    
    # Configure Header & Footer
    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hrun = hp.add_run("JAYA ENGINEERING COLLEGE | 1st Year CCR System Report")
    hrun.font.name = "Arial"
    hrun.font.size = Pt(8.5)
    hrun.font.color.rgb = RGBColor(120, 120, 120)

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    frun = fp.add_run("Department of Science & Humanities — Course Coverage Report (CCR) Specification")
    frun.font.name = "Arial"
    frun.font.size = Pt(8.5)
    frun.font.color.rgb = RGBColor(120, 120, 120)

# Colors
NAVY = RGBColor(11, 65, 205)      # #0B41CD Primary Accent
DARK = RGBColor(30, 41, 59)      # Slate Dark
MUTED = RGBColor(100, 116, 139)  # Slate Muted
WHITE = RGBColor(255, 255, 255)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def add_title(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(36)
    p.paragraph_format.space_after = Pt(12)
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(24)
    run.font.bold = True
    run.font.color.rgb = NAVY

def add_subtitle(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(24)
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(13)
    run.font.italic = True
    run.font.color.rgb = MUTED

def add_heading_1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(20)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = NAVY

def add_heading_2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(12.5)
    run.font.bold = True
    run.font.color.rgb = DARK

def add_heading_3(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = DARK

def add_paragraph(text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = DARK
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(10)
    r.font.color.rgb = DARK
    return p

def add_bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = DARK
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(10)
    r.font.color.rgb = DARK
    return p

def add_code_block(code_text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.right_indent = Inches(0.2)
    
    # Border/shading hack via paragraph
    run = p.add_run(code_text)
    run.font.name = 'Consolas'
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(15, 23, 42)

def add_callout(title, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, "EFF6FF") # Soft Blue
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Inches(0.1)
    p.paragraph_format.right_indent = Inches(0.1)
    
    r_title = p.add_run(f"📌 {title}\n")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(10.5)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY
    
    r_text = p.add_run(text)
    r_text.font.name = "Arial"
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = DARK
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# ==================== DOCUMENT GENERATION ====================

# Cover / Header Title
add_title("JAYA ENGINEERING COLLEGE")
add_subtitle("DEPARTMENT OF SCIENCE & HUMANITIES (S&H)\nCourse Coverage Report (CCR) System — Comprehensive 10-Page Customization Specification & Technical Manual")

add_callout(
    "DOCUMENT METADATA & EXECUTIVE PURPOSE",
    "This comprehensive specification document provides an exhaustive technical and operational analysis of the 1st Year Department (Science & Humanities) customizations within the Course Coverage Report (CCR) Management System at Jaya Engineering College (JEC). It covers software architecture, database design, REST API specifications, section template configurations (SEC-A through SEC-G), automated document generation (PDF/Word), offline caching engines, master data entry pipelines, and complete faculty-subject matrices."
)

# ---------------------------------------------------------
# CHAPTER 1
# ---------------------------------------------------------
add_heading_1("1. Institutional Context & Problem Formulation")

add_heading_2("1.1 Background of the 1st Year Engineering Department")
add_paragraph("The 1st Year Department (Science & Humanities) at Jaya Engineering College serves as the foundational academic baseline for all incoming undergraduate engineering students. Unlike upper-level academic departments (CSE, ECE, EEE, Mechanical, Civil) which operate within isolated departmental boundaries, the 1st Year Department governs all first-year students across 10 specialized degree programs:")
add_bullet(" Computer Science & Engineering (CSE)", "1. ")
add_bullet(" Computer Science & Communication Engineering (CCE)", "2. ")
add_bullet(" Information Technology (IT)", "3. ")
add_bullet(" Artificial Intelligence & Machine Learning (AIML)", "4. ")
add_bullet(" Computer Science & Business Systems (CSBS)", "5. ")
add_bullet(" Aeronautical Engineering (Aero)", "6. ")
add_bullet(" Mechanical Engineering (Mech)", "7. ")
add_bullet(" Robotics & Automation (Robo)", "8. ")
add_bullet(" Electronics & Communication Engineering (ECE)", "9. ")
add_bullet(" Electrical & Electronics Engineering (EEE)", "10. ")

add_heading_2("1.2 Legacy Academic Progress Tracking Challenges")
add_paragraph("Prior to the rollout of the digitized Course Coverage Report (CCR) Management System, tracking syllabus progress for the 1st Year Department suffered from profound administrative bottlenecks:")
add_bullet("Class coordinators physically collected paper weekly registers from up to 45 individual faculty members, manually calculating completed hours versus Anna University target hours.", "Fragmented Paper Registers: ")
add_bullet("Because S&H professors (Mathematics, Physics, Chemistry, English) teach across multiple engineering branches, compiling section-wise reports required cross-referencing dozens of disconnected Excel workbooks.", "Cross-Departmental Faculty Matrix: ")
add_bullet("The Head of Department (HOD) and the Principal lacked real-time dashboard metrics, making it impossible to detect syllabus lag prior to internal assessment examinations.", "Lack of Real-Time Visibility: ")
add_bullet("Paper logs frequently lacked details regarding specific sub-topics completed, leading to discrepancies during official NBA and NAAC academic compliance audits.", "Inconsistent Topic Data: ")

add_heading_2("1.3 Objectives of the 1st Year CCR Customization Project")
add_paragraph("The customized CCR system addresses these challenges through a unified mobile and web platform tailored specifically to the structural dynamics of the 1st Year S&H Department:")
add_bullet("Partition 1st-year students into 7 distinct administrative sections (SEC-A through SEC-G) with pre-configured subject loads.", "Automated Section Partitioning: ")
add_bullet("Enable shared S&H professors to log progress for multiple sections from a single dashboard without changing user accounts.", "Unified Multi-Section Dashboard: ")
add_bullet("Provide subject teachers with interactive checkable topic lists mapped to the Anna University 2026-2027 curriculum.", "Pre-Loaded Syllabus Checklists: ")
add_bullet("Allow teachers to submit weekly logs in under 2 minutes, even when offline in campus laboratories.", "Rapid Mobile Logging: ")
add_bullet("Generate official college-formatted PDF and Word summary reports automatically for HOD and Principal review.", "One-Click Compliance Reporting: ")

# ---------------------------------------------------------
# CHAPTER 2
# ---------------------------------------------------------
add_heading_1("2. Technical Coding Architecture & Framework Design")

add_heading_2("2.1 High-Level System Architecture")
add_paragraph("The CCR Management System utilizes a modern, resilient multi-tier architecture optimized for high performance, offline durability, and institutional privacy:")

add_code_block("""+-----------------------------------------------------------------------+
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
+-----------------------------------------------------------------------+""")

add_heading_2("2.2 Centralized Section Template Engine (sectionTemplates.ts)")
add_paragraph("At the core of the 1st-year coding customization is the section template registry located in frontend/src/config/sectionTemplates.ts. This module serves as the single source of truth for section metadata, department groupings, academic term identifiers, and pre-allocated subject templates:")

add_code_block("""export interface TemplateSubjectItem {
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
};""")

add_heading_2("2.3 Section Template Parsing & Utility Functions")
add_paragraph("To handle non-standard section strings and provide seamless UI fallbacks across the application, sectionTemplates.ts provides specialized helper functions:")
add_bullet(" Normalizes raw user input or database strings (e.g., '1st Year SEC-A', 'SEC A', 'Section-A') into a standard key format.", "getSectionTemplate(classId):")
add_bullet(" Strips non-examinable workshop/extracurricular activities (e.g., Life Skills, Physical Education) prior to compiling final academic coverage percentages.", "filterNonAcademicSubjects(subjects):")

# ---------------------------------------------------------
# CHAPTER 3
# ---------------------------------------------------------
add_heading_1("3. Database Schema & Data Modeling")

add_heading_2("3.1 MongoDB Data Model (Primary Backend Store)")
add_paragraph("The MongoDB production database enforces strict data structures mapped via Prisma ORM to represent 1st-year subjects, sections, faculty credentials, and progress logs:")

add_code_block("""// Prisma / MongoDB Conceptual Schema Representation

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
}""")

add_heading_2("3.2 SQLite Local Client Database (connection.ts)")
add_paragraph("On mobile client devices, a lightweight SQLite database initialized in database/connection.ts enables local offline querying and log queueing. The local schema includes pre-seeded timetable slots (t100 through t134) specifically configured for 1st-year classrooms:")

add_code_block("""// SQLite Timetable Slot Seeding (connection.ts)
{ id: 't100', day_of_week: 'Monday', period: 1, subject_code: 'MA25C01', subject_name: 'APPLIED CALCULUS', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Karuppaiya' },
{ id: 't101', day_of_week: 'Monday', period: 2, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mrs. Gopikha' },
{ id: 't103', day_of_week: 'Monday', period: 4, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Saravanan' },
{ id: 't104', day_of_week: 'Monday', period: 5, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Bhuvaneshwari' },
{ id: 't105', day_of_week: 'Monday', period: 6, subject_code: 'CS25C01', subject_name: 'COMPUTER PROGRAMMING:C', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mrs. Agnus' }""")

# ---------------------------------------------------------
# CHAPTER 4
# ---------------------------------------------------------
add_heading_1("4. Data Entry & Operational Workflows")

add_heading_2("4.1 Role 1: Subject Teacher (2-Minute Mobile Workflow)")
add_paragraph("To ensure maximum adoption among faculty members, the progress entry workflow was engineered for rapid completion on mobile devices (Android/iOS):")
add_bullet("Upon login, the app inspects the teacher's faculty ID and presents distinct cards for every assigned section (e.g. '1st Year SEC-A - Applied Physics', '1st Year SEC-C - Applied Physics').", "Step 1: Dashboard Section Selection — ")
add_bullet("The teacher inputs three primary numerical values for the week: Planned Periods (default pre-filled), Handled Periods (actual hours taken in class), and Required Periods (extra hours needed if syllabus is lagging).", "Step 2: Period Metrics Entry — ")
add_bullet("The app displays pre-loaded syllabus topics for the unit being taught. The teacher checks off completed sub-topics (e.g. [X] Matrices & Eigenvalues, [X] Cayley-Hamilton Theorem).", "Step 3: Interactive Topic Selection — ")
add_bullet("If completed hours fall below planned hours, the teacher selects or types a reason for delay (e.g., 'Industrial Visit', 'College Sports Day', 'Mid-Term Revision').", "Step 4: Delay Reasoning — ")
add_bullet("Tap 'Submit Weekly Log'. If online, the payload posts to the REST server immediately. If offline, the transaction is saved to local SQLite and queued for automatic background sync.", "Step 5: One-Tap Submission — ")

add_heading_2("4.2 Role 2: Class Counselor / Coordinator (Section Consolidation)")
add_paragraph("Each 1st-year section (SEC-A through SEC-G) is assigned a dedicated Class Counselor. The Counselor dashboard consolidates individual subject entries into a single administrative view:")
add_bullet("Displays a grid showing all 9 subjects, assigned professors, completed contact hours, cumulative coverage percentage, and pending topics.", "Unified Grid View: ")
add_bullet("Appends overall weekly summary notes (e.g., 'All subject logs received. Math coverage on schedule; Physics extra hours scheduled for Saturday').", "Coordinator Remarks: ")
add_bullet("Submits the section compilation directly to the HOD queue with digital timestamping.", "One-Click HOD Submission: ")

add_heading_2("4.3 Role 3: Head of Department (HOD S&H Verification)")
add_paragraph("The 1st Year HOD evaluates section submissions across all 7 parallel streams:")
add_bullet("Visual progress indicators display overall coverage health for SEC-A, SEC-B, SEC-C, SEC-D, SEC-E, SEC-F, and SEC-G.", "Multi-Section Overview: ")
add_bullet("The HOD can review detailed topic breakdowns or flag lagging subjects for academic intervention.", "Granular Audit & Feedback: ")
add_bullet("Approving a section report automatically locks the weekly log, updates central institutional archives, and generates formatted PDF documents.", "One-Tap Digital Approval: ")

add_heading_2("4.4 Role 4: Principal & Institutional Oversight")
add_paragraph("The Principal dashboard provides high-level executive analytics comparing the 1st Year S&H Department against senior departmental streams (CSE, ECE, EEE, Mechanical). The Principal can monitor compliance rates, inspect delayed subjects across the entire college, and export institutional PDF reports for governing bodies.")

# ---------------------------------------------------------
# CHAPTER 5
# ---------------------------------------------------------
add_heading_1("5. Automated Document Generation Engine (PDF & Word)")

add_heading_2("5.1 PDF Compilation Architecture (reportPdfTemplate.ts)")
add_paragraph("The application features an automated document generation engine that compiles raw weekly database logs into publication-grade HTML templates, which are subsequently rendered into downloadable PDF files. The engine extracts metadata dynamically based on section IDs:")

add_code_block("""// Dynamic HTML Template Generation Snippet (reportPdfTemplate.ts)
export const generateReportHTML = (report: ConsolidatedReport): string => {
  const { classId, weekNumber, subjects } = report;
  const displaySubjects = filterNonAcademicSubjects(subjects || []);
  const template = getSectionTemplate(classId);

  const tableRowsHtml = displaySubjects.map((subj, index) => {
    const plannedBullets = subj.plannedTopicsText
      ? subj.plannedTopicsText.split(/[,\\n]/).map(t => `<li>${t.trim()}</li>`).join('')
      : '<li>Standard Syllabus Topics</li>';
      
    const actualBullets = subj.topicsCoveredText
      ? subj.topicsCoveredText.split(/[,\\n]/).map(t => `<li>${t.trim()}</li>`).join('')
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
};""")

add_heading_2("5.2 Word Document Generation Engine (reportWordTemplate.ts)")
add_paragraph("In addition to PDF generation, the system supports exporting official Word (.docx) documents compatible with Microsoft Office. The Word generator constructs native OpenXML table structures, applying JEC institutional branding, navy header formatting (#0B41CD), and explicit signature lines for the Class Counselor, HOD, and Principal.")

# ---------------------------------------------------------
# CHAPTER 6
# ---------------------------------------------------------
add_heading_1("6. Complete Section-by-Section Roster & Subject Matrix")

add_heading_2("6.1 Master Section-Branch Allocation Summary")
add_paragraph("The 1st Year Department governs 7 parallel academic sections. The table below illustrates the branch allocations and section distributions:")

table1 = doc.add_table(rows=8, cols=4)
table1.alignment = WD_TABLE_ALIGNMENT.CENTER
table1.style = 'Table Grid'

t1_headers = ['Section Code', 'Engineering Departments / Branches', 'Lecture Room', 'Assigned Counselor']
for idx, text in enumerate(t1_headers):
    cell = table1.cell(0, idx)
    set_cell_background(cell, "0B41CD")
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.bold = True
    r.font.color.rgb = WHITE

t1_data = [
    ('SEC-A', 'Computer Science & Engineering (CSE)', 'LH-10A', 'Dr. KARUPPAIYA'),
    ('SEC-B', 'Computer Science & Communication Engineering (CSE & CCE)', 'LH-10B', 'Mrs. A.VANI BERLINA'),
    ('SEC-C', 'Information Technology (IT)', 'LH-10C', 'Mr. SRINIVASAN'),
    ('SEC-D', 'Artificial Intelligence & Machine Learning / CSBS (AIML/CSBS)', 'LH-10D', 'Mrs. KAVITHA'),
    ('SEC-E', 'Aeronautical, Mechanical & Robotics Engineering (Aero/Mech/Robo)', 'LH-10E', 'Dr. GOPIKUMAR'),
    ('SEC-F', 'Electronics & Communication Engineering (ECE)', 'LH-10F', 'Mrs. JASLINE'),
    ('SEC-G', 'Electrical & Electronics Engineering (EEE)', 'LH-10G', 'Dr. SARAVANAN'),
]

for r_idx, r_data in enumerate(t1_data, start=1):
    for c_idx, text in enumerate(r_data):
        cell = table1.cell(r_idx, c_idx)
        if r_idx % 2 == 1:
            set_cell_background(cell, "F8FAFC")
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(9)
        if c_idx == 0:
            r.font.bold = True

add_heading_2("6.2 Detailed Subject-Faculty Matrix for SEC-A (CSE)")
add_paragraph("The following matrix represents the exact configuration pre-loaded into frontend/src/config/sectionTemplates.ts for 1st Year SEC-A:")

table2 = doc.add_table(rows=10, cols=5)
table2.alignment = WD_TABLE_ALIGNMENT.CENTER
table2.style = 'Table Grid'

t2_headers = ['S.No', 'Subject Code', 'Subject Title', 'Staff In-Charge', 'Weekly Periods']
for idx, text in enumerate(t2_headers):
    cell = table2.cell(0, idx)
    set_cell_background(cell, "0B41CD")
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.bold = True
    r.font.color.rgb = WHITE

t2_data = [
    ('1', 'MA25C01', 'Applied Calculus', 'Dr. KARUPPAIYA', '6'),
    ('2', 'ENG25C01', 'English Essential', 'Mrs. Gopikha', '3'),
    ('3', 'UC25H01', 'Heritage of Tamil', 'Dr. JOSPHIN', '2'),
    ('4', 'PH25C01', 'Applied Physics - 1', 'Dr. SARAVANAN', '6'),
    ('5', 'CY25C01', 'Applied Chemistry - 1', 'Dr. Bhuvaneshwari', '6'),
    ('6', 'CS25C01', 'Computer Programming in C', 'Mrs. Agnus', '6'),
    ('7', 'CS25C03', 'Essentials of Computing', 'Mrs. Archana', '5'),
    ('8', 'ME25C16/EE25C16', 'Makerspace', 'Mr. D.SIVAKUMAR', '3'),
    ('9', 'UC25A01', 'Life Skills for Engineers-I', 'Mr. D.SIVAKUMAR & Mrs. BHAKYALAKSHMI', '2'),
]

for r_idx, r_data in enumerate(t2_data, start=1):
    for c_idx, text in enumerate(r_data):
        cell = table2.cell(r_idx, c_idx)
        if r_idx % 2 == 1:
            set_cell_background(cell, "F8FAFC")
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(8.5)
        if c_idx in [0, 1]:
            r.font.bold = True

# ---------------------------------------------------------
# CHAPTER 7
# ---------------------------------------------------------
add_heading_1("7. Detailed Feature & Workflow Comparison Matrix")

add_paragraph("The table below contrasts the technical software customizations against operational data entry procedures, highlighting how specific code modules streamline day-to-day administrative tasks:")

table3 = doc.add_table(rows=7, cols=3)
table3.alignment = WD_TABLE_ALIGNMENT.CENTER
table3.style = 'Table Grid'

t3_headers = ['Feature Category', 'Coding & Architecture Customization', 'Data Entry & Operational Workflow']
for idx, text in enumerate(t3_headers):
    cell = table3.cell(0, idx)
    set_cell_background(cell, "0B41CD")
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.bold = True
    r.font.color.rgb = WHITE

t3_data = [
    ('Section Management', 'Centralized template registry in sectionTemplates.ts mapping SEC-A to SEC-G.', 'Automatic pre-filtering of assigned section cards upon user login.'),
    ('Shared Faculty Access', 'Multi-tenant database query resolution supporting cross-department professors.', 'Teachers log progress across multiple 1st-year sections from 1 dashboard.'),
    ('Syllabus Data Entry', 'Pre-seeded database topic tables for Anna University Semester I core subjects.', 'Checklist selection of topics; eliminates typing long lesson titles.'),
    ('Offline Operations', 'SQLite mutation queue with background auto-sync REST endpoints.', 'Teachers enter class logs in ground-floor labs without Wi-Fi connection.'),
    ('Compliance Reporting', 'Dynamic OpenXML (.docx) and HTML/PDF compilation engines.', 'One-click generation of formatted weekly CCR reports for HOD and Principal.'),
    ('Domain Security', 'REST API JWT validation restricting access exclusively to @jec.com accounts.', 'Automatic account provisioning via master Excel credential imports.')
]

for r_idx, r_data in enumerate(t3_data, start=1):
    for c_idx, text in enumerate(r_data):
        cell = table3.cell(r_idx, c_idx)
        if r_idx % 2 == 1:
            set_cell_background(cell, "F8FAFC")
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(8.5)
        if c_idx == 0:
            r.font.bold = True

# ---------------------------------------------------------
# CHAPTER 8
# ---------------------------------------------------------
add_heading_1("8. Security, Private Distribution & Compliance")

add_heading_2("8.1 Institutional Domain Validation")
add_paragraph("To protect institutional intellectual property and academic progress data, the CCR system implements rigid authentication security protocols:")
add_bullet("User login and account registration are strictly restricted to official college email addresses ending in @jec.com. Requests from public domains (gmail.com, yahoo.com) are automatically rejected at the API gateway.", "Domain Enforcement: ")
add_bullet("All API transactions require a signed JSON Web Token (JWT) passed in the Authorization header. Tokens expire after 24 hours of inactivity.", "Token-Based Authentication: ")

add_heading_2("8.2 Private Mobile App Distribution Strategy")
add_paragraph("To prevent competing institutions from inspecting or duplicating the internal academic workflows of Jaya Engineering College, the application bypasses public app store listings in favor of enterprise private deployment channels:")
add_bullet("Distributed exclusively through Google Workspace Managed Google Play, binding app installations strictly to verified @jec.com Android devices.", "Managed Google Play (Private Apps): ")
add_bullet("Deploys private iOS installation packages via unlisted redemption codes managed through Apple Business Manager.", "Apple Custom Apps: ")
add_bullet("Hosted on an internal campus server protected by a strict network firewall, restricting web dashboard access to local campus Wi-Fi networks.", "Self-Hosted JEC Campus Portal: ")

# ---------------------------------------------------------
# CHAPTER 9
# ---------------------------------------------------------
add_heading_1("9. System Maintenance, Troubleshooting & Roadmap")

add_heading_2("9.1 Routine Maintenance Protocols")
add_paragraph("To ensure continuous operation across academic terms, system administrators must perform standardized end-of-semester maintenance:")
add_bullet("Update sectionTemplates.ts with Semester II subject codes (e.g. MA25C02 Vector Calculus, PH25C02 Physics for Electronics).", "Semester Rollover: ")
add_bullet("Archive completed 1st-year weekly logs to cold database storage to maintain high query responsiveness for incoming batches.", "Database Archiving: ")

add_heading_2("9.2 Troubleshooting Common Operational Issues")
add_bullet("Instruct faculty to connect to campus Wi-Fi briefly to allow the client SQLite queue to flush pending logs to MongoDB.", "Issue 1: Logs Pending in Offline Queue — ")
add_bullet("Verify that the teacher email in 1st_Year_Faculty_Details.xlsx matches their registered login ID exactly.", "Issue 2: Assigned Section Card Missing — ")

add_heading_2("9.3 Future Enhancement Roadmap")
add_bullet("Integrate predictive analytics to flag subjects at risk of syllabus deficit 3 weeks prior to internal assessments.", "AI Velocity Forecasting: ")
add_bullet("Correlate topic completion rates directly with student attendance data to measure academic impact.", "Attendance Correlation Engine: ")

# Save Document
os.makedirs("Document", exist_ok=True)
output_path = "Document/1st_Year_Comprehensive_10Page_Customization_Report.docx"
doc.save(output_path)
print(f"Successfully generated {output_path}")
