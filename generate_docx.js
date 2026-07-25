const fs = require('fs');
const path = require('path');
const { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  TextRun, 
  BorderStyle,
  VerticalAlign,
  HeadingLevel
} = require('./frontend/node_modules/docx');

// Create the document
const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        // College Header / Letterhead
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'JAYA ENGINEERING COLLEGE',
              bold: true,
              size: 32, // 16pt
              color: 'B71C1C',
              font: 'Times New Roman',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: '(Approved by AICTE, New Delhi | Affiliated to Anna University, Chennai)',
              bold: true,
              size: 16, // 8pt
              color: '0D47A1',
              font: 'Times New Roman',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'Accredited by NAAC & NBA (CSE) | Thiruninravur, Chennai - 602024',
              bold: true,
              size: 16, // 8pt
              color: '0D47A1',
              font: 'Times New Roman',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: '__________________________________________________________________________',
              bold: true,
              color: 'CCCCCC',
            }),
          ],
        }),
        new Paragraph({ text: '\n' }),

        // Report Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'PROJECT STATUS & LAUNCH REPORT',
              bold: true,
              size: 28, // 14pt
              color: '1A237E',
              font: 'Times New Roman',
            }),
          ],
        }),
        new Paragraph({ text: '\n' }),

        // Metadata Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: '1A237E' },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: '1A237E' },
            left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 15, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'TO:', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  width: { size: 85, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'The Dean, Jaya Engineering College', size: 20 })] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 15, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'FROM:', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  width: { size: 85, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'CCMS Project Development Team, Department of CSE', size: 20 })] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 15, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'DATE:', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  width: { size: 85, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'July 25, 2026', size: 20 })] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 15, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'SUBJECT:', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  width: { size: 85, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Demonstration Feedback, Development Progress, and Launch Plan for the Class Coordinator Management System (CCMS)', size: 20 })] })],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: '\n' }),

        // 1. Executive Summary
        new Paragraph({
          children: [
            new TextRun({ text: '1. Executive Summary', bold: true, size: 24, color: '1A237E' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({
              text: 'The ',
              size: 22,
            }),
            new TextRun({
              text: 'Class Coordinator Management System (CCMS)',
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: ' is a comprehensive application designed to streamline and automate academic tracking, weekly syllabus coverage monitoring, and progress log maintenance. This report provides a detailed summary of the recent HOD demonstration, feedback received, resolution status of requested features, and the finalized deployment plan for the Computer Science & Engineering department.',
              size: 22,
            }),
          ],
        }),
        new Paragraph({ text: '' }),

        // 2. Project Status & Modification Timeline
        new Paragraph({
          children: [
            new TextRun({ text: '2. Project Status & Modification Timeline', bold: true, size: 24, color: '1A237E' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: '•  Dean\'s Feedback (Prior Requests): ', bold: true, size: 22 }),
            new TextRun({ text: 'Completed ', bold: true, color: '2E7D32', size: 22 }),
            new TextRun({ text: '(100% finished and verified).', size: 22 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: '•  HOD\'s Feedback (Requested on July 23, 2026): ', bold: true, size: 22 }),
            new TextRun({ text: 'In Progress ', bold: true, color: 'E65100', size: 22 }),
            new TextRun({ text: '(Ongoing development to restrict user registration and login exclusively to the college domain). Expected completion date: ', size: 22 }),
            new TextRun({ text: 'July 29, 2026.', bold: true, size: 22 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // 3. HOD Demonstration & Feedback Summary
        new Paragraph({
          children: [
            new TextRun({ text: '3. HOD Demonstration & Feedback Summary', bold: true, size: 24, color: '1A237E' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({
              text: 'On July 23, 2026, the development team presented a live demonstration of the CCMS mobile application to the Head of the Department (HOD) of Computer Science & Engineering.',
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Key Feedback & Discussions:', bold: true, size: 22 }),
          ],
        }),
        new Paragraph({
          spacing: { before: 60 },
          children: [
            new TextRun({ text: '1. General Evaluation: ', bold: true, size: 22 }),
            new TextRun({ text: 'The HOD commended the application\'s user interface, navigation flows, and the automated weekly syllabus completion report engine, noting that it will significantly reduce the administrative workload for class coordinators.', size: 22 }),
          ],
        }),
        new Paragraph({
          spacing: { before: 60 },
          children: [
            new TextRun({ text: '2. App Distribution & Accessibility: ', bold: true, size: 22 }),
            new TextRun({ text: 'The HOD inquired about the distribution model and how faculty members would download the application. The team explained that the application will be hosted on the ', size: 22 }),
            new TextRun({ text: 'Google Play Store', bold: true, size: 22 }),
            new TextRun({ text: ' (for Android devices) and the ', size: 22 }),
            new TextRun({ text: 'Apple App Store', bold: true, size: 22 }),
            new TextRun({ text: ' (for iOS devices) under the official college developer credentials to ensure secure and verified distribution.', size: 22 }),
          ],
        }),
        new Paragraph({
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({ text: '3. Security & Domain Restriction: ', bold: true, size: 22 }),
            new TextRun({ text: 'To ensure authorized access, the HOD requested restricting authentication specifically to the college domain (', size: 22 }),
            new TextRun({ text: '@jec.com', bold: true, size: 22 }),
            new TextRun({ text: '). The development team is actively implementing this change in the authentication service (target completion: ', size: 22 }),
            new TextRun({ text: 'July 29, 2026', bold: true, size: 22 }),
            new TextRun({ text: ').', size: 22 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // 4. Deployment & Launch Plan
        new Paragraph({
          children: [
            new TextRun({ text: '4. Deployment & Launch Plan', bold: true, size: 24, color: '1A237E' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: '•  Target Launch Date: ', bold: true, size: 22 }),
            new TextRun({ text: 'July 31, 2026', bold: true, size: 22 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '•  Scope: ', bold: true, size: 22 }),
            new TextRun({ text: 'Initial roll-out for the Computer Science & Engineering (CSE) Department.', size: 22 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: '•  Implementation Roadmap: ', bold: true, size: 22 }),
            new TextRun({ text: 'Following completion of domain restrictions on July 29, the app will undergo a pilot test before the official release to all department faculty on July 31.', size: 22 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // 5. Project Development Team
        new Paragraph({
          children: [
            new TextRun({ text: '5. Project Development Team', bold: true, size: 24, color: '1A237E' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({ text: 'The project is being developed by a dedicated team from the CSE Department (3rd & 4th Year - CSE A):', size: 22 }),
          ],
        }),

        // Team Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          },
          rows: [
            // Header Row
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 10, type: WidthType.PERCENTAGE },
                  shading: { fill: 'E0E0E0' },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'S.No', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  shading: { fill: 'E0E0E0' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Team Member', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  shading: { fill: 'E0E0E0' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Department/Year', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { fill: 'E0E0E0' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Role & Responsibility', bold: true, size: 20 })] })],
                }),
              ],
            }),
            // Row 1
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '1', size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Hariprasath', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: '4th Year - CSE A', size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Mobile Application – Frontend & Backend Development', size: 20 })] })],
                }),
              ],
            }),
            // Row 2
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '2', size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Deepak S', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: '4th Year - CSE A', size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Database Architecture & Prisma Schema (MongoDB)', size: 20 })] })],
                }),
              ],
            }),
            // Row 3
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '3', size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Akashprabu', bold: true, size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: '3rd Year - CSE A', size: 20 })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Testing & SQLite Offline Validation', size: 20 })] })],
                }),
              ],
            }),
          ],
        }),
      ],
    },
  ],
});

// Pack the document into a base64 string or write to file
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(__dirname, 'Project_Report.docx'), buffer);
  console.log('DOCX report successfully generated at Project_Report.docx');
}).catch((err) => {
  console.error('Error generating DOCX:', err);
  process.exit(1);
});
