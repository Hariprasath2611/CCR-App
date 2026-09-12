import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
import os

doc = docx.Document()

# Set Margins
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# Helper functions for styling
def add_title(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(22)
    run.font.bold = True
    run.font.color.rgb = RGBColor(11, 65, 205) # Navy Blue

def add_subtitle(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(13)
    run.font.italic = True
    run.font.color.rgb = RGBColor(100, 100, 100)

def add_heading_1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(11, 65, 205)

def add_heading_2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = RGBColor(40, 40, 40)

def add_paragraph(text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(10.5)
    return p

def add_bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(10.5)
    return p

def set_cell_background(cell, fill_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    tcPr.append(shd)

# Title & Subtitle
add_title('COURSE COVERAGE REPORT (CCR) SYSTEM')
add_subtitle('1st Year Department (Science & Humanities) Customization Report')
doc.add_paragraph()

# Executive Summary
add_heading_1('1. Executive Summary & Brief Overview')
add_paragraph('This document outlines the detailed technical coding architecture and operational data entry customizations implemented for the 1st Year Department (Science & Humanities / S&H) at Jaya Engineering College within the Course Coverage Report (CCR) System.')
add_bullet(' The 1st Year Department encompasses 7 parallel sections (SEC-A through SEC-G) spanning multiple engineering branches including CSE, CCE, IT, AIML, CSBS, Aero, Mech, Robo, ECE, and EEE.', 'Multi-Section Scope:')
add_bullet(' S&H faculty members (Mathematics, Physics, Chemistry, English, Humanities) teach across multiple sections, requiring multi-section role access.', 'Shared Faculty Resources:')
add_bullet(' Built on Anna University Semester I core curriculum (Applied Calculus, Applied Physics, Applied Chemistry, Computer Programming in C, Essentials of Computing).', 'Standardized Core Curriculum:')
add_bullet(' Subject teachers can record weekly class progress in under 2 minutes, with automatic aggregation for Class Counselors and HOD approval.', 'Rapid Data Entry:')

# Coding Customizations
add_heading_1('2. Coding & Technical Architecture Customizations')

add_heading_2('A. Section Templates Registry (sectionTemplates.ts)')
add_paragraph('The frontend application implements a centralized configuration registry mapping section codes (SEC-A to SEC-G) to specific academic years, semesters, departments, and pre-loaded subject catalogs:')
add_bullet('SEC-A: Computer Science & Engineering (CSE) - 9 Subjects (MA25C01, ENG25C01, UC25H01, PH25C01, CY25C01, CS25C01, CS25C03, ME25C16, UC25A01)')
add_bullet('SEC-B: Computer Science & Communication Engineering (CSE & CCE)')
add_bullet('SEC-C: Information Technology (IT)')
add_bullet('SEC-D: Artificial Intelligence & Machine Learning / CSBS (AIML/CSBS)')
add_bullet('SEC-E: Aeronautical, Mechanical & Robotics Engineering (Aero/Mech/Robo)')
add_bullet('SEC-F & SEC-G: Electronics & Communication / Electrical Engineering (ECE/EEE)')

add_heading_2('B. Shared Faculty Mapping & Database Seeding (connection.ts)')
add_paragraph('In the SQLite/MongoDB schema layer, 1st-year timetable records (slots t100 through t134) link shared professors to multiple sections. When a single professor logs into the mobile app, the system dynamically queries and displays distinct subject cards for every section they teach.')

add_heading_2('C. PDF & Word Document Formatting Engines (reportPdfTemplate.ts & reportWordTemplate.ts)')
add_paragraph('Automated report engines format 1st-year progress reports according to JEC academic compliance standards:')
add_bullet('Filters non-academic rows (e.g. Life Skills, Physical Education) while retaining metrics for core theory and lab subjects.')
add_bullet('Computes planned periods, handled periods, cumulative coverage percentages, and deviation reasons.')
add_bullet('Generates high-resolution PDF/Word downloads with official college headers and signature blocks.')

add_heading_2('D. Offline Sync & Cache Engine')
add_paragraph('React Native local SQLite cache allows faculty to input class logs in low-connectivity zones (e.g., ground-floor physics/chemistry labs). The offline queue automatically syncs data to the central REST server upon network reconnection.')

# Data Entry Workflows
add_heading_1('3. Data Entry & Operational Workflows')

add_heading_2('A. 2-Minute Faculty Progress Logging')
add_paragraph('Subject teachers follow a streamlined 4-step mobile/web logging workflow:')
add_bullet('Select Assigned Section Card from dashboard (e.g. 1st Year SEC-A).')
add_bullet('Input Period Metrics: Enter numbers for Planned Periods, Handled Periods, and Required Periods.')
add_bullet('Check Completed Topics: Tick off completed syllabus topics from pre-loaded topic checklists (eliminates manual typing).')
add_bullet('Log Delay Reasons: Select or type reasons if coverage is behind schedule (e.g. holiday, lab exam).')

add_heading_2('B. Master Batch Data Ingestion')
add_paragraph('To eliminate manual setup errors, 1st-year data is pre-ingested from institutional master files:')
add_bullet('1st_Year_Faculty_Details.xlsx: Maps teacher names, emails (@jec.com), and assigned sections.')
add_bullet('1st_Year_Faculty_Credentials.xlsx: Provisions secure account credentials for seamless onboarding.')

add_heading_2('C. Class Counselor & HOD Approval')
add_bullet('Class Counselors view a unified dashboard showing all 9 subjects assigned to their section, append weekly summary remarks, and submit to the HOD in 1 click.')
add_bullet('The 1st Year HOD reviews section submissions on a consolidated screen and approves reports with one-tap digital verification.')

# Matrix Table
add_heading_1('4. Customization Comparison Matrix')

table = doc.add_table(rows=6, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.style = 'Table Grid'

headers = ['Feature Area', 'Coding Customization (Technical)', 'Data Entry Customization (Operational)']
for col_idx, text in enumerate(headers):
    cell = table.cell(0, col_idx)
    set_cell_background(cell, '0B41CD')
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(10)
    run.font.bold = True
    run.font.color.rgb = RGBColor(255, 255, 255)

data = [
    ('Section Configuration', 'Dynamic section mapping registry (SEC-A to SEC-G) in sectionTemplates.ts', 'Pre-filtered 1st-year section cards per faculty dashboard'),
    ('Faculty Allocation', 'Multi-section query logic supporting shared S&H professors', 'Seamless switching between SEC-A, SEC-B, etc., in 1 tap'),
    ('Syllabus Data', 'Database schema pre-loaded with Anna University 1st-year subject codes', 'Pre-checked topic selection (no manual typing required)'),
    ('Offline Connectivity', 'SQLite local caching with auto-sync REST API endpoints', 'Offline draft saving for low-signal classrooms and laboratories'),
    ('Report Generation', 'Custom PDF/Word template rendering engines', '1-click export of official weekly CCR documents for HOD/Principal')
]

for row_idx, row_data in enumerate(data, start=1):
    for col_idx, text in enumerate(row_data):
        cell = table.cell(row_idx, col_idx)
        if row_idx % 2 == 1:
            set_cell_background(cell, 'F2F4F8')
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(2)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(9.5)
        if col_idx == 0:
            run.font.bold = True

os.makedirs('Document', exist_ok=True)
output_path = 'Document/1st_Year_Customization_Report.docx'
doc.save(output_path)
print(f'Successfully generated {output_path}')
